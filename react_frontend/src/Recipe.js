import React from 'react'

const Recipe = props => {
    if (!Object.entries(props).length && props.constructor === Object) {
        return <div>Nothing to show</div>
    }
    return (
        <div className="recipe-container">
            <h2>{props.Title}</h2>
            <p className="recipe-body">{props.Body}</p>
            <TagList tags={props.Labels} />
        </div>
    )
}

const TagList = props => {
    if (!props.tags || !props.tags.length) {
        return <div>no tags</div>
    }
    const tags = props.tags.map((tag) => {
        return <li key={tag.ID}>{tag.Label}</li>
    })
    return <ul className='taglist'>{tags}</ul>
}
export default Recipe
