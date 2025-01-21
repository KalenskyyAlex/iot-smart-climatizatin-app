import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

// MQTT Broker Configuration
const MQTT_BROKER = 'mqtt://hyperion-gw.fei.tuke.sk:1883';
const MQTT_TOPIC = 'gw/sc-main/ok080fe/data';
const MQTT_AC_TOPIC = 'gw/sc-ac-controller/ok080fe/data';
const MQTT_AC_SET = 'gw/sc-main/ok080fe/set';

const client = mqtt.connect(MQTT_BROKER, {
  username: 'maker',
  password: 'this.is.mqtt',
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 30 * 1000,
});

// Initialize the 2x3 grid with null values
let ac_status: any
let desired_temp: number
let temperatureGrid = Array(2)
  .fill(null)
  .map(() => Array(3).fill(null));

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('Error subscribing to MQTT topic:', err);
    } else {
      console.log(`Successfully subscribed to topic: ${MQTT_TOPIC}`);
    }
  });
});
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(MQTT_AC_TOPIC, (err) => {
    if (err) {
      console.error('Error subscribing to MQTT topic:', err);
    } else {
      console.log(`Successfully subscribed to topic: ${MQTT_AC_TOPIC}`);
    }
  });
});
client.on('message', (topic, message) => {
  try {
    if (topic === MQTT_TOPIC) {
      const data = JSON.parse(message.toString());
      ac_status = data.ac_cmd
      // Check if heatmap data exists and is in the correct format
      if (data.heatmap && Array.isArray(data.heatmap)) {
        // Reset grid before processing new data
        temperatureGrid = Array(2)
          .fill(null)
          .map(() => Array(3).fill(null));

        let sumTemperatures = 0;
        let count = 0;

        // Process the heatmap data and populate the grid
        data.heatmap.forEach((sensor: { x: number; y: number; t: number }) => {
          const { x, y, t } = sensor;
          if (x >= 1 && x <= 3 && y >= 1 && y <= 2) {
            temperatureGrid[y - 1][x - 1] = t; // Adjust to 0-based index
            sumTemperatures += t;
            count++;
          }
        });

        // Calculate a fake temperature for the missing sensor (x=3, y=2)
        const avgTemperature = sumTemperatures / count;
        temperatureGrid[1][2] = avgTemperature; // Place fake temperature at (x=3, y=2)

        console.log('Updated temperature grid:', temperatureGrid);
      } else {
        console.error('Invalid heatmap data structure:', data);
      }
    }
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// Setup Express route to serve the temperature grid
app.get('/api/heatmap', (req, res) => {
  console.log('GET /api/heatmap hit');
  res.json(temperatureGrid);
});
app.get('/api/ac-control', (req, res) => {
  console.log('GET /api/ac-control hit');
  res.json(ac_status);
});
app.post('/api/ac-control', (req, res) => {
  ac_status = req.body.ac_status
  console.log('Received data:',  ac_status );
  
  // Respond to the client
  const message = { ac_cmd:ac_status };
  client.publish(MQTT_AC_SET, JSON.stringify(message), (err) => {
    if (err) {
      console.error('Failed to publish message:', err);
      return res.status(500).json({ error: 'Failed to send message to MQTT broker' });
    } else {
      console.log(`Message published to topic "${MQTT_AC_SET}":`, message);
      return res.status(200).json({
        message: 'Data received and published to MQTT successfully!',
        receivedData: ac_status,
      });
    }
  });
res.status(200).json({
  message: 'Data received successfully!',
  receivedData:  ac_status ,
});
});
app.post('/api/ac-temp', (req, res) => {
  console.log(req.body)
  desired_temp = req.body.desired_temp
  console.log('Received data:',  desired_temp );
  
  // Respond to the client
  const message = { desired_temp:desired_temp };
  client.publish(MQTT_AC_SET, JSON.stringify(message), (err) => {
    if (err) {
      console.error('Failed to publish message:', err);
      return res.status(500).json({ error: 'Failed to send message to MQTT broker' });
    } else {
      console.log(`Message published to topic "${MQTT_AC_SET}":`, message);
      return res.status(200).json({
        message: 'Data received and published to MQTT successfully!',
        receivedData: desired_temp,
      });
    }
  });
res.status(200).json({
  message: 'Data received successfully!',
  receivedData:  desired_temp ,
});
});

// Start Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 