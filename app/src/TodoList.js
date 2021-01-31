import React, {useState, useEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes, faLocationArrow, faTrash } from '@fortawesome/free-solid-svg-icons'
import { UncontrolledTooltip } from 'reactstrap';

const IMPORTANCE = ['green', 'yellow', 'red']

const TodoMaker = ({year, month, getToDos, dateInfo}) => {

    const [show, setShow] = useState(1);
    const [importance, setImportance] = useState(0);
    const [title, setTitle] = useState('');

    const submit = () => {
        if(localStorage.getItem('token') === null)
            return;
        fetch('http://localhost:5000/createTodo', {
            method : "POST",
            headers : {
                "Authorization" : `Bearer ${localStorage.getItem('token')}`,
                "Content-Type" : 'application/json'
            },
            body : JSON.stringify({todo : {
                title,
                importance,
                day : dateInfo.day,
                month : dateInfo.month + 1,
                year : dateInfo.year
            }})
        }).then(res => res.json()).then(res => {
            if(res.err){
                console.log(res.err);
                alert('Internal server error, action failed.')
            } else {
                getToDos(new Date(year, month));
            }
        })
    }

    const toolTipSettings = {
        padding : "3px",
        borderRadius : "5px",
        transitionDuration : "100ms"
    }

    return <div className='todomaker'>
        <div onClick={() => setShow(0)} className={`blocker ${show === 0 ? 'h0' : 'h1'}`}><span id='highlight-white'><FontAwesomeIcon icon={faPlus}/></span></div>
        <div className='todoform'>
            <span id='whitebg'>
                <FontAwesomeIcon onClick={() => setShow(1)} icon={faTimes}/>
            </span>
            <input value={title} onChange={(e) => {setTitle(e.target.value)}} placeholder='Enter you todo here' type='textarea'></input>
            <span id='whitebg1' onClick={() => {setImportance(p => (p+1)%3)}}>
                <div style={{backgroundColor:IMPORTANCE[importance], 
                borderRadius:"50%",
                height:"12px",
                width:"12px"
            }}></div>
            </span>
            <UncontrolledTooltip style={toolTipSettings} placement='top' target='whitebg1'>
                Click here to change importance
            </UncontrolledTooltip>
            <span onClick={submit} id='whitebg'>
                <FontAwesomeIcon icon={faLocationArrow}/>
            </span>
        </div>
    </div>
}

const TodoList = ({year, month, getToDos, dateInfo, todos=[]}) => {

    const [curTodos, setCurTodos] = useState(todos);

    const update = (todoid, checked) => {
        fetch('http://localhost:5000/updateTodo', {
            method : "PUT",
            headers : {
                "Authorization" : `Bearer ${localStorage.getItem('token')}`,
                "todo-id" : `${todoid}#${checked}`
            }
        }).then(res => res.json()).then(res => {
            if(res.err){
                console.log(res.err);
                alert('An internal server error occurred.');
            } else {
                console.log(res);
                getToDos(new Date(year, month));
            }
        })
    }

    const del = (todoid) => {
        fetch('http://localhost:5000/deleteTodo', {
            method : "DELETE",
            headers : {
                "Authorization" : `Bearer ${localStorage.getItem('token')}`,
                "todo-id" : `${todoid}`
            }
        }).then(res => res.json()).then(res => {
            if(res.err){
                console.log(res.err);
                alert('An internal server error occurred.');
            } else {
                getToDos(new Date(year, month));
            }
        })
    }

    useEffect(() => {setCurTodos(todos)}, [todos]);

return <div className='todolist'>
    <div className='todonav'>
        <h4>Todos for the day</h4>
    </div>
    <div className='todos'>
        {curTodos.map(ele => {

            const impStiyl = {
                borderLeft : `5px solid ${IMPORTANCE[ele.IMPORTANCE]}`
            }

            return <div key={ele.TODOID}  className='todo'>
            
                    <div className='flex-row-start' style={{width:"70%"}}>
                        <span id='whitebg'>
                            <div style={{backgroundColor:IMPORTANCE[ele.IMPORTANCE], 
                            borderRadius:"50%",
                            height:"12px",
                            width:"12px"
                            }}></div>
                        </span>
                        <h4>{ele.TITLE}</h4>
                    </div>

                    <div className='flex-row-start' style={{width:"20%"}}>
                        <span onClick={() => {update(ele.TODOID, ele.DONE)}} id="whitebg">
                            <input checked={ele.DONE==='Y'} type='checkbox'></input>
                        </span>
                        <span onClick={() => {del(ele.TODOID)}} id="whitebg">
                            <FontAwesomeIcon icon={faTrash}/>
                        </span>
                    </div>
            </div>
        })}
    </div>
    <TodoMaker year={year} month={month} getToDos={getToDos} dateInfo={dateInfo}/>
</div>
}

export default TodoList;