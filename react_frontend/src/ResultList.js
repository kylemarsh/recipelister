import React from 'react'

const ResultList = props => {
    const rows = props.items.map((item) => {
        return (
            <li
                key={item.id}
                id={item.id}
                onClick={props.handleClick}
            >
                {item.title}
            </li>
        )
    })
    return <ul>{rows}</ul>
}

export default ResultList
