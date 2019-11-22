import React from 'react'

const Recipe = props => {
    if (!Object.entries(props).length && props.constructor === Object) {
        return <div>Nothing to show</div>
    }
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
        return <li key={tag}>{tag}</li>
    })
    return <ul className='taglist'>{tags}</ul>
}
export default Recipe
