import random
import string
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from flask import Flask, request, jsonify
app = Flask(__name__)

def generar_codigo_verificacion():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def enviar_correo_verificacion(destinatario, codigo_verificacion):
    mensaje = MIMEMultipart()
    mensaje['From'] = 'juandiegojimenezvalverde@gmail.com'
    mensaje['To'] = destinatario
    mensaje['Subject'] = 'Código de verificación'

    mensaje.attach(MIMEText(f'Tu código de verificación es: {codigo_verificacion}', 'plain'))

    try:
        servidor_smtp = smtplib.SMTP('smtp.gmail.com', 587)
        servidor_smtp.starttls()
        servidor_smtp.login('juandiegojimenezvalverde@gmail.com', 'ltka ieuc naur zvms')
        servidor_smtp.send_message(mensaje)
        servidor_smtp.quit()
        print('Correo enviado correctamente')
    except Exception as e:
        print('Error al enviar el correo electrónico:', str(e))

@app.route('/enviar_correo_verificacion', methods=['POST'])
def enviar_correo_verificacion():
    datos = request.json
    destinatario = datos['correo']
    codigo_verificacion = generar_codigo_verificacion()

    mensaje = MIMEMultipart()
    mensaje['From'] = 'tu_correo@gmail.com'
    mensaje['To'] = destinatario
    mensaje['Subject'] = 'Código de verificación'

    mensaje.attach(MIMEText(f'Tu código de verificación es: {codigo_verificacion}', 'plain'))

    try:
        servidor_smtp = smtplib.SMTP('smtp.gmail.com', 587)
        servidor_smtp.starttls()
        servidor_smtp.login('juandiegojimenezvalverde@gmail.com', 'ltka ieuc naur zvms')
        servidor_smtp.send_message(mensaje)
        servidor_smtp.quit()
        return jsonify({'mensaje': 'Correo enviado correctamente', 'codigo_verificacion': codigo_verificacion})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(port=5001) 