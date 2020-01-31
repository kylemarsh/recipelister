import React from 'react'

const QueryForm = props => {
    return (
        <form>
            <input
                placeholder="Search recipe titles"
                name="fragments"
                type='text'
                value={props.fragments}
                onChange={props.handleChange} />
        </form>
    )
}

export default QueryForm
