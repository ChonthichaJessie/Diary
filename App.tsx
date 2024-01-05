import React from 'react-native';
import {useEffect} from 'react';
import Home from './Components/Home';
import notifee, {
  AuthorizationStatus,
  IntervalTrigger,
  TimeUnit,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

//Notifee
const checkPermissions = async () => {
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    console.log('Permission settings:', settings);
    return true;
  } else {
    console.log('User declined permissions');
    return false;
  }
};

const scheduleNotification = async () => {
  const hasPermissions = await checkPermissions();
  if (hasPermissions) {
    const date = new Date(Date.now());
    date.setHours(11);
    date.setMinutes(5);

    const trigger: IntervalTrigger = {
      type: TriggerType.INTERVAL,
      interval: 12,
      timeUnit: TimeUnit.HOURS,
    };

    const notificationDetails = {
      id: '1',
      title: `🫰🏻 Did you find the best photo of the day`,
      body: 'Take it, if you have not found it yet',
      android: {
        channelId: 'reminder',
        pressAction: {
          id: 'default',
        },
      },
      data: {
        id: '1',
        action: 'reminder',
        details: {},
      },
    };
    await notifee.createTriggerNotification(notificationDetails, trigger);
  }
};

const App = () => {
  //Calling Notifee
  useEffect(() => {
    scheduleNotification();
  }, []);

  return <Home />;
};

export default App;
