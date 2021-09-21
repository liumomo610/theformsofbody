#include <BluetoothSerial.h>


#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

/* this sketch reads the EMG signal from a pin on esp32
  and print it on the serial port for further processing */
BluetoothSerial SerialBT;
//pin numbers on esp32 for EMG sensors
int EMGPin1 = 15;
int EMGPin2 = 16;

//vars for sensor values
int sensorValue1 = 0;
int sensorValue2 = 0;


void setup() {
  Serial.begin(115200); //baud rate for esp32
  SerialBT.begin("esp32BT1");

  //  if (!SerialBT.begin("esp32BT1")) {
  //    Serial.println("an error occurred when initializing esp32 bluetooth");
  //  } //error proof if esp32 didn't initialize its bluetooth serial

}

void loop() {

  sensorValue1 = analogRead(EMGPin1);
  SerialBT.println(sensorValue1);

  delay(100);
}
