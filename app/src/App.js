import React, {Component, useState, useEffect} from 'react';
import Cal from './Cal.js'
import SidePanel from './SidePanel.js'
import LoginPanel from './LoginPanel.js'
import './App.css'

const days = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

const Calendar = ({todos, getToDos, togglePanel}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [today, setToday] = useState(new Date());
  const [showLoginPanel, setShowLoginPanel] = useState(0);
  const [forceReset, setForceReset] = useState({});

  
  useEffect(() => {
    getToDos(currentDate);
  },[currentDate,today,forceReset])

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
      <Cal.CalBody todos={todos} togglePanel={togglePanel} today={currentDayFlag} {...dateInfo}/>
      <LoginPanel display={showLoginPanel} changeDisplay={setShowLoginPanel}/>
    </div>
  );
}

class App extends Component{
  constructor(){
    super();
    this.state = {
      showPanel : false,
      todos : [],
      allTodos : [],
    }
    this.togglePanel = this.togglePanel.bind(this);
  }

  getToDos(currentDate){
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
        console.log("GOTTEN TODOS: ",res.data);
        this.setState({allTodos : res.data}, () => {
          if(this.state.showPanel === true){

            const TODOIDS = this.state.allTodos.map(ele => ele.TODOID);

            let tempcur = [...this.state.allTodos];
            tempcur = tempcur.filter(ele => {
              return ele._DAY === this.state.day && ele._MONTH === this.state.month + 1 && ele._YEAR === this.state.year
            })
            this.setState({todos : tempcur});
          }
        });
        // setTodos(res.data);
      }
    })
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
        day : day,
        month : month,
        year : year,
        todos : myTodos
      }));
    }
  }

  componentDidMount(pp,ps){
    this.getToDos(new Date());
  }

  render(){

    const {showPanel, ...dateInfo} = this.state;

    return (
      <div className='body-wrapper'>
          <Calendar todos={this.state.allTodos} getToDos={(x) => {this.getToDos(x)}} togglePanel={this.togglePanel}/>
          <SidePanel todos={this.state.todos} getToDos={(x) => {this.getToDos(x)}} cancelPanel={this.togglePanel} {...dateInfo} show={this.state.showPanel}/>
      </div>
    );
  }
}

export default App;