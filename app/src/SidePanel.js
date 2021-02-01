import React from 'react';
import {Names} from './week.js'
import TodoList from './TodoList.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const SidePanel = ({getToDos, todos, show, cancelPanel,...dateInfo}) => {

    let dayOfWeek = new Date(dateInfo.year,dateInfo.month,dateInfo.day).getDay();
    let suff = "st";
    if(dateInfo.day === 2)
        suff = "nd";
    else if(dateInfo.day === 3)
        suff = "rd";
    else if(dateInfo.day !== 1 && dateInfo.day !== 31)
        suff = "th";

    return <div className={`sidePanel${show ? " showNow" : ""}`}>
        <FontAwesomeIcon icon={faTimes} className={`${show ? "shown" : "cancel"}`} onClick={() => {cancelPanel(dateInfo.day,dateInfo.month,dateInfo.year,-1)}}/>
        <div className={`sidePanel-nav${show ? " showSidePanelNav" : ""}`}>
            <h3 >{Names.week[dayOfWeek]}{show ? ", " : ""}</h3>
            <h3>{dateInfo.day}{show ? suff : ""}</h3>
            <h3>{Names.month[dateInfo.month]}</h3>
            {/* <h3>{dateInfo.year}</h3> */}
        </div>
        <TodoList year={dateInfo.year} month={dateInfo.month} getToDos={getToDos} dateInfo={dateInfo} todos={todos}/>
    </div>
}

export default SidePanel;