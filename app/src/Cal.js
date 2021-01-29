import React from 'react';
import {Names} from './week.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UncontrolledTooltip } from 'reactstrap';
import { faChevronCircleLeft, faChevronCircleRight, faDotCircle, faBars } from '@fortawesome/free-solid-svg-icons'

const CalCard = ({myTodos,day,month,year,spl,clicked}) => {
    return <td onClick={() => {
        console.log('HEREEEEEE', myTodos);
        clicked(day,month,year,spl,myTodos)
    }} className={spl ? 'glow' : ''}>{<h3>{day}</h3>}</td>
}

const CalRow = ({s,e,op}) => {
    console.log(s,e);
    const days = [];

    for(let i = s ; i<=e ; i++){
        days.push(op(i))
    }

    return <tr className='d-flex'>
        {days}
    </tr>
}

const CalNav = ({changeLogin,month,year,nextMonth,prevMonth,today}) => {

    const toolTipSettings = {
        padding : "3px",
        borderRadius : "5px",
        transitionDuration : "100ms"
    }

    return (
        <div className='calNav'>
            <div className='calNavBars'>
                <FontAwesomeIcon onClick={() => {changeLogin(p => p === 0 ? 1 : 0)}} icon={faBars}/>
            </div>
            <div>
                <h1>
                    {Names.month[month]},
                </h1>
                <h1>
                    {year}
                </h1>
            </div>
            <div className='calNavControl'>
                <FontAwesomeIcon id="goLeft" icon={faChevronCircleLeft} onClick={prevMonth}/>
                <FontAwesomeIcon id="stayToday" icon={faDotCircle} onClick={today}/>
                <FontAwesomeIcon id="goRight" icon={faChevronCircleRight} onClick={nextMonth}/>
                <UncontrolledTooltip style={toolTipSettings} placement="top" target="goLeft">
                    Previous Month
                </UncontrolledTooltip>
                <UncontrolledTooltip style={toolTipSettings} placement="bottom" target="stayToday">
                    Today
                </UncontrolledTooltip>
                <UncontrolledTooltip style={toolTipSettings} placement="top" target="goRight">
                    Next Month
                </UncontrolledTooltip>
            </div>
        </div>
    );
}

const CalBody = ({todos = [],days,month,year,today,togglePanel}) => {
    const rows = [];
    for(let i = 1 ; i<=days ; i++){

        const todoList = [];
        for(let x of todos){
            // console.log(x._YEAR, x._MONTH, x._DAY);
            // console.log(year, month, i);
            if(x._YEAR === year && x._MONTH-1 === month && x._DAY === i){
                console.log("AYAHN PE", x._YEAR, x._MONTH, x._DAY);
                todoList.push({...x});
            }
        }

        rows.push(<CalCard myTodos={todoList} clicked={togglePanel} key={i} month={month} year={year} day={i} spl={today===i}/>)
    }

    return (
        <div className='calBody'>
            <table className='table'>
                <tbody>
                    <tr className='d-flex flex-row flex-wrap'>
                        {rows}
                    </tr>
                </tbody>
            </table>
        </div>
    );

    // const rows = [];
    // for(let i = 1, p = 1 ; i<=Math.ceil(days/7) ; i++){
    //     let s,e;
    //     s = p;
    //     e = (i<=4 ? 7*i : p + (days - 29));
    //     p = e+1;
    //     rows.push(<CalRow s={s} e={e} key={i} op={
    //         (i) => {
    //             return <CalCard clicked={togglePanel} key={i} month={month} year={year} day={i} spl={today===i}/>
    //         }
    //     }/>)
    // }

    // return (
    //     <div className='calBody'>
    //         {/* <h1 children={`days: ${days}`}/> */}
    //         <table class='table'>
    //             <tbody>
    //                 {rows}
    //             </tbody>
    //         </table>
    //     </div>
    // );
}

export default {
    CalNav,
    CalBody
}