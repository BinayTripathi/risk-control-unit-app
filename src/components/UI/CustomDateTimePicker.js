import React from "react";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

// Opens the native Android date dialog, then the time dialog, and reports the combined Date once both are confirmed.
// NOTE: DateTimePickerAndroid is Android-only; the app ships only an Android build.
const CustomDateTimePicker = ({ dateTimeInParent, setDateTimeInParent, label, children }) => {

    const openTimePicker = (date) =>
      DateTimePickerAndroid.open({
        value: date,
        mode: 'time',
        onChange: (event, dateTime) => {
          if (event.type !== 'set') return
          dateTime.setSeconds(0, 0)
          // minimumDate only limits the calendar, so a time earlier today can still be picked
          if (dateTime < new Date()) {
            Dialog.show({ type: ALERT_TYPE.WARNING, title: 'Time has passed', textBody: 'Please pick a time later than now.', button: 'OK' })
            return
          }
          setDateTimeInParent(dateTime)
        },
      })

    const openPicker = () => {
      const now = new Date()
      DateTimePickerAndroid.open({
        value: now,
        mode: 'date',
        minimumDate: now,
        onChange: (event, date) => {
          if (event.type === 'set') openTimePicker(date)
        },
      })
    }

    return React.Children.map(children, child =>
      React.cloneElement(child, {
        title: dateTimeInParent === '' ? label : dateTimeInParent,
        onPress: openPicker,
      })
    )
}


export default CustomDateTimePicker;
