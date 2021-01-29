import React, {Component, useState, useEffect} from 'react';
import Cal from './Cal.js'
import SidePanel from './SidePanel.js'
import LoginPanel from './LoginPanel.js'
import './App.css'

const days = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

const Calendar = (props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const [showLoginPanel, setShowLoginPanel] = useState(0);
  const [todos, setTodos] = useState([]);
  const [forceReset, setForceReset] = useState({});

  
  useEffect(() => {
    console.log('in use effect...')
    if(localStorage.getItem('token') === null)
      return;

    fetch("http://localhost:5000/getTodos",{
      method : "POST",
      headers : {
        "Authorization" : `Bearer ${localStorage.getItem('token')}`,
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({
        month : currentDate.getMonth(),
        year : currentDate.getFullYear(),
      })
    }).then(res => res.json()).then(res => {
      if(res.err){
        console.log("ERROR IN GETTING...");
      } else {
        console.log(res.data);
        setTodos(res.data);
      }
    })

  },[currentDate,today,forceReset])

  useEffect(() => {console.log('use effecting...')})

  const setBackToday = () => {
    setCurrentDate(today);
  }

  const nextMonth = () => {
    //new Date(year,month,0);
    let curMonth = currentDate.getMonth();
    let curYear = currentDate.getFullYear();
    if(curMonth === 11){
      setCurrentDate(new Date(curYear + 1, 0));
    } else {
      setCurrentDate(new Date(curYear,curMonth+1));
    }
  }

  const prevMonth = () => {
    let curMonth = currentDate.getMonth();
    let curYear = currentDate.getFullYear();
    if(curMonth === 0){
      setCurrentDate(new Date(curYear - 1, 11));
    } else {
      setCurrentDate(new Date(curYear,curMonth-1));
    }
  }

  let currentDayFlag= false;
  if(currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear())
    currentDayFlag = today.getDate();

  let dateInfo = {
    month : currentDate.getMonth(),
    year : currentDate.getFullYear(),
    days : days(currentDate).getDate()
  }

  return (
    <div className="calWrapper">
      <Cal.CalNav changeLogin={setShowLoginPanel} today={setBackToday} prevMonth={prevMonth} nextMonth={nextMonth} {...dateInfo} />
      <Cal.CalBody todos={todos} togglePanel={props.togglePanel} today={currentDayFlag} {...dateInfo}/>
      <LoginPanel display={showLoginPanel} changeDisplay={setShowLoginPanel}/>
    </div>
  );
}

class App extends Component{
  constructor(){
    super();
    this.state = {
      showPanel : false,
      todos : []
    }
    this.togglePanel = this.togglePanel.bind(this);
  }

  togglePanel(day,month,year,spl,myTodos){
    if(day === this.state.day && month === this.state.month && this.state.year === year){
      this.setState(state => ({
        showPanel : false,
        day : undefined,
        month : undefined,
        year : undefined,
      }));
    } else {
      this.setState(state => ({
        showPanel : true,
        day,month,year,todos : myTodos
      }));
    }
  }

  componentDidMount(pp,ps){
    console.log(pp,ps);
  }

  render(){

    const {showPanel, ...dateInfo} = this.state;

    return (
      <div className='body-wrapper'>
          <Calendar togglePanel={this.togglePanel}/>
          <SidePanel todos={this.state.myTodos} cancelPanel={this.togglePanel} {...dateInfo} show={this.state.showPanel}/>
      </div>
    );
  }
}

export default App;