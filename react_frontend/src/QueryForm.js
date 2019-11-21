import React, {Component} from 'react'

class QueryForm extends Component {
    constructor(props) {
        super(props)
        this.initialState = {fragments: ""}
        this.state = this.initialState
    }

    handleChange = event => {
        const {name, value} = event.target
        this.setState({[name]:value})
    }

    submitForm = () => {
        this.props.handleSubmit(this.state)
        this.setState(this.initialState)
    }

    render () {
        const {fragments} = this.state
        return (
            <form>
                <input
                    placeholder="Search recipe titles"
                    name="title_fragments"
                    type='text'
                    value={fragments}
                    onChange={this.handleChange} />
                <input
                    type="button"
                    value = "Search"
                    name="action"
                    onClick={this.submitForm} />
            </form>
        )
    }
}

export default QueryForm
