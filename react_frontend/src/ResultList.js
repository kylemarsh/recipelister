import React from 'react'

const ResultList = props => {
    const rows = props.items.map((item) => {
        return (
            <li
                class="result-list-item"
                key={item.ID}
                id={item.ID}
                onClick={props.handleClick}
            >
                {item.Title}
            </li>
        )
    })
    return <div class="result-list"><ul>{rows}</ul></div>
}

export default ResultList
