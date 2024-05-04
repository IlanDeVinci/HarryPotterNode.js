import network   # Importation des fonctionnalités liées au WiFi
import urequests    # Importation des fonctionnalités liées aux requêtes HTTP
import utime    # Importation des fonctionnalités liées au temps
import ujson    # Importation des fonctionnalités liées à la conversion en JSON
from machine import Pin, PWM

wlan = network.WLAN(network.STA_IF) # Met la raspberry pi en mode client wifi
wlan.active(True) # Active le mode client wifi

# Infos pour connexion WiFi
ssid = 'iPhone Ilan'
password = 'coronass'
wlan.connect(ssid, password)
url = "http://172.20.10.3:3000"

# Initialisation des pins
pwm_ledR = PWM(Pin(17, mode=Pin.OUT))
pwm_ledR.freq(1_000)
pwm_ledV = PWM(Pin(18, mode=Pin.OUT))
pwm_ledV.freq(1_000)
pwm_ledB = PWM(Pin(19, mode=Pin.OUT))
pwm_ledB.freq(1_000)

leds = [pwm_ledR ,pwm_ledV, pwm_ledB]

# Dictionnaire des maisons avec couleur de LEDs qui correspond
houses = { 
    "Gryffindor": [30000, 5, 5],
    "Slytherin": [5, 30000, 5],
    "Ravenclaw": [5, 5, 30000],
    "Hufflepuff": [30000, 30000, 5],
    "Nothing": [30000, 5, 30000]
}

# Attente de la connexion au réseau WiFi
while not wlan.isconnected():
    print("Pas encore connecté...")
    utime.sleep(1)

if wlan.isconnected():
    print("Connexion établie")

def resetColor():
    for led in leds:
        led.duty_u16(0)
# Boucle
while True:
    try:
        print("GET")
        print(url)
        # Requête GET pour accéder à la maison du personnage
        reponse = urequests.get(url)
        print(reponse)
        print("DONE")
        
        # Récupération de la maison
        house = reponse.json()["lastHouseVisited"]
        print(house)
        reponse.close()
        # Fermeture de la requête
            
        # Attribution des valeurs de LED correspondantes à la maison
        i = 0
        for led in leds:
            led.duty_u16(houses[house][i])
            i+=1
        
        #pwm_ledR.duty_u16(houses[house][0])
        #pwm_ledV.duty_u16(houses[house][1])
        #pwm_ledB.duty_u16(houses[house][2])
        
        # Stop avant réinitialisation
        utime.sleep(2)
        
        # Réinitialisation
        resetColor()
            

     
    
        
    except Exception as erreur:
        print("Erreur:", erreur)
        utime.sleep(1)




