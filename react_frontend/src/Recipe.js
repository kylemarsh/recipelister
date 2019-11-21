import React from 'react'

const Recipe = props => {
    return (
        <div>
            <h2>{props.title}</h2>
            <p>{props.instructions}</p>
            <TagList tags={props.tags} />
        </div>
    )
}

const TagList = props => {
    const tags = props.tags.map((tag) => {
        return <li>{tag}</li>
    })
    return <ul class='taglist'>{tags}</ul>
}
export default Recipe
