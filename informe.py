import random
import string
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/enviarInforme', methods=['POST'])
def enviarInforme():
    datos = request.json
    destinatario = datos['correo']
    mensajePagos = datos['mensajePagos']
    print(destinatario)

    mensaje = MIMEMultipart()
    mensaje['From'] = 'tu_correo@gmail.com'
    mensaje['To'] = destinatario
    mensaje['Subject'] = 'Informe de matrícula'

    mensaje.attach(MIMEText(f'A continuación se muestrará el informe de las matrículas realizadas: {mensajePagos}', 'plain'))#
    try:
        servidor_smtp = smtplib.SMTP('smtp.gmail.com', 587)
        servidor_smtp.starttls()
        servidor_smtp.login('juandiegojimenezvalverde@gmail.com', 'ltka ieuc naur zvms')
        servidor_smtp.send_message(mensaje)
        servidor_smtp.quit()
        return jsonify({'mensaje': 'Correo enviado correctamente', 'Mensaje de pago': mensajePagos})#
    except Exception as e:
        print('Error:', str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002)
