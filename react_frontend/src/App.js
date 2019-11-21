import React, {Component} from 'react'
import './main.css'
import QueryForm from './QueryForm'
import ResultList from './ResultList'
import Recipe from './Recipe'

class App extends Component {
    render () {
        return (
            <div className="medium-container">
                <h1>Liz's Recipe Database</h1>
                <QueryForm handleSubmit={this.handleSubmit} />
                <ResultList items={this.sampleResults} />
                <Recipe {...this.sampleResults[0]} />
            </div>
        )
    }

    handleSubmit = (query) => {
        // Make the API call here.
    }

    sampleResults = [
        {
            id: 23,
            title: "Chicken Pot Pie",
            tags: ['chicken', 'main', 'soup/stew'],
            instructions: "1 Chicken\n3 cups water\nSpices"
        },
        {
            id: 42,
            title: "Decadent Cake",
            tags: ['dessert', 'cake', 'baking'],
            instructions: "Preheat oven to 350\nEmpty box into bowl\nMix in 3 eggs\nBake for 40 min",
        },
    ]
}

export default App;
