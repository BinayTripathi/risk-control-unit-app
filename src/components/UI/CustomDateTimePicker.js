import React, { useState } from "react";
import { StyleSheet, View} from "react-native"; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';


 const CustomDateTimePicker = ({ dateTimeInParent, setDateTimeInParent, label, children}) => {

    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [dateTimeMod, setDateTimeMode] = useState("date")
    const [dt, setDt] = useState(new Date());




    const onChange = (e, selectedDate) => {
       /* console.log(e)
        console.log(showDate)
        setDateTimeInParent(selectedDate.toLocaleString());
        setDateTimeInt(selectedDate)
        setShowDate(false)
        if(dateTimeMod === 'date') {
          setDateTimeMode('time')
          setShowDate(false)
          setShowTime(true)
        } else {
          setShowTime(false)
        }*/
        
    };
    
    const showMode = (mode) => {
        setShowDate(true)
        setDateTimeMode(mode)        
    }

    const onDismissSingle = () => {
      setShowDate(false);
    }
  
    const onConfirmSingle = (params) => {   
        setDt(new Date(params.date));        
        setShowDate(false);                   
        setShowTime(true);
        setDateTimeInParent(dt.toLocaleString());
      }

    const onDismiss = () => {
      setShowTime(false)
    }
  
    const onConfirm = 
      ({hours,minutes}) => {
        setShowTime(false);
        let currTime = dt
        currTime.setHours(hours)
        currTime.setMinutes(minutes)
        setDt(currTime)
        setDateTimeInParent(currTime.toLocaleString());
      }

    const DatePicker = () => showDate ?
                      <View><DateTimePicker value={dt} mode={"date"} is24Hour={true} onChange={onChange} display="spinner"/></View> : null
    
    const TimePicker = () => showTime  ? <View><DateTimePicker value={dt} mode={"time"} is24Hour={true} onChange={onChange} display="spinner"/></View>
                       : null
  

    let renderChildren= ()=> {
      return React.Children.map(children, child => {
        return React.cloneElement(child, {
          ...child.props,
          title: dateTimeInParent === '' ? label : dt.toLocaleString(),
          onPress: () => showMode("date")
        })
      })
    }

    return  (   
    <View>
          { renderChildren() }  
          <DatePickerModal locale="en" mode="single" visible={showDate} date={dt} onDismiss={onDismissSingle}  onConfirm={onConfirmSingle}/>
          <TimePickerModal visible={showTime}  onDismiss={onDismiss} onConfirm={onConfirm} hours={12} minutes={14}
        />
          
    </View>)

}


const styles = StyleSheet.create({

textBase: {
    color: 'black',
  },

  label1: {
    fontSize: 15,
    fontWeight: 'bold',
    margin: 8,
  }

})


export default CustomDateTimePicker;