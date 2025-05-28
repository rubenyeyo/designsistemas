# Walmart de México                                                            
# Autor      : Ruben Valdes
# UserID     : vn533y7
# Creación   : 14-Abril-2025
# ver 1.1    : 28-Mayo-2025 - Consolidación Framework 2.0
#------------------------------------------------------------#
# Propósito  : CARGA INCREMENTAL DE LA TABLA cons_mx_ecomm_hs.wcp_oh_return_fact
# Proyecto   : ONE HALLWAY - Framework 2.0 Consolidado
# Estructura : 7 pasos optimizados con tablas intermedias


from pathlib import Path
from airflow import DAG
from datetime import datetime, timedelta,date
from workflow_framework import framework
from workflow_framework.config import *
from workflow_framework import callbacks
from other.utilities_airflow.email_utils import send_email_message
from airflow.models.param import Param

workflow = 'ECOMM-WMX-INC-CONS_MX_ECOMM_HS-WCP_OH_RETURN_FACT-HS'
config_file = 'ecomm_wmx_inc_cons_mx_ecomm_wcp_oh_rtn_fact_hs_config.yaml'
config_path = 'inc/cons_mx_ecomm_hs/wcp_oh_return_fact/'

# Corrige la forma de cargar el archivo de configuración
script_dir = Path(__file__).parent
config_full_path = script_dir / config_file
if not config_full_path.exists():
    # Intenta buscar en la ruta relativa al script si la ruta absoluta no funciona
    config_full_path = Path(config_path) / config_file

framework = framework.Framework(workflow, config_full_path)
ops_emails = ['one_hallway_mx@email.wal-mart.com']
tags = ['ecomm', 'P1','SPARK SQL', 'OH', 'INCREMENTAL', 'FRAMEWORK_2.0']
sla_mins = 120
priority = 'P1'

def sla_miss_callback(context):
    callbacks.sla_miss_callback(context, workflow, priority)

# Create the DAG
with DAG(workflow,
         default_args={
             'retries': 3,
             'retry_delay': timedelta(minutes=5),
             'email': ops_emails,
             'email_on_failure': False,
             'email_on_retry': False,
             'on_failure_callback': send_email_message,
             'project': 'One Hallway - ECOMM - WCP_RETURN_FACT - Framework 2.0',
             'sla': timedelta(minutes=int(sla_mins)),
         },
         description=workflow + ' - Framework 2.0 Consolidado con 7 pasos',
         schedule_interval="0 4,12,20 * * *", 
         start_date=datetime(2023, 1, 1),
         catchup=False,
         sla_miss_callback=sla_miss_callback,
         tags=tags,
         max_active_runs=1,
         params={
             'flag_load_type': Param(default='inc', type='string', enum=['inc', 'hist'], values_display={'inc': 'Incremental', 'hist': 'Historic'}),
             'start_date_hist': Param(default=date.today().strftime('%Y-%m-%d'), type='string', format='date'),
             'end_date_hist': Param(default=date.today().strftime('%Y-%m-%d'), type='string', format='date')}
         ) as dag:
        
    # Define workflow tasks - Framework 2.0 Structure (7 pasos consolidados)
    
    # Inicio de tareas
    start = framework.build_task('START', 'start')
    
    # Paso 1: Core consolidado - RO + ROL (Return Orders + Return Order Lines)
    load_stg_rtn_core = framework.build_task('SPARK_SQL','load_stg_rtn_core',
                                    {'flag_load_type': '{{params.flag_load_type}}',
                                     'start_date_hist': '{{params.start_date_hist}}',
                                     'end_date_hist': '{{params.end_date_hist}}'})
    
    # Paso 2: Status consolidado - ROSL + ROGL + RCL + ROGLC (Status + Group + Receipt + Carrier)
    load_stg_rtn_status = framework.build_task('SPARK_SQL','load_stg_rtn_status')
    
    # Paso 3: Orders consolidado - SO + SOL + SOP + CAC (Sales Orders + Lines + Promos + Customer)
    load_stg_rtn_order = framework.build_task('SPARK_SQL','load_stg_rtn_order')
    
    # Paso 4A: Payment consolidado - OP (Order Payment)
    load_stg_rtn_payment = framework.build_task('SPARK_SQL','load_stg_rtn_payment')
    
    # Paso 4B: Fulfillment consolidado - FOL + SOFD (Fulfillment Order Line + Sales Order Fulfillment Details)
    load_stg_rtn_fulfillment = framework.build_task('SPARK_SQL','load_stg_rtn_fulfillment')
    
    # Paso 4C: Shipment consolidado - SPOSL + SPS + CDT (Sales PO Shipment + Shipment + Carrier Delivery Track)
    load_stg_rtn_shipment = framework.build_task('SPARK_SQL','load_stg_rtn_shipment')
    
    # Paso 5: Final Assembly - PNO + ITID + Final Fact Table
    load_rtn_fact_final = framework.build_task('SPARK_SQL','load_rtn_fact_final')
    
    # Tarea para finalizar y eliminar el clúster
    end = framework.build_task('END','end',trigger_rule='all_done')

    # Definición del flujo de trabajo - Framework 2.0 Completo
    # Flujo optimizado: 7 pasos con paralelización de pasos 4A, 4B, 4C
    start >> load_stg_rtn_core >> load_stg_rtn_status >> load_stg_rtn_order
    
    # Los pasos 4A, 4B, 4C pueden ejecutarse en paralelo después del paso 3
    load_stg_rtn_order >> [load_stg_rtn_payment, load_stg_rtn_fulfillment, load_stg_rtn_shipment]
    
    # El paso final espera a que terminen todos los pasos 4A, 4B, 4C
    [load_stg_rtn_payment, load_stg_rtn_fulfillment, load_stg_rtn_shipment] >> load_rtn_fact_final >> end