import React, {Component} from 'react'
import './main.css'
import QueryForm from './QueryForm'
import ResultList from './ResultList'
import Recipe from './Recipe'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            allRecipes: [],
            results: [],
            currentRecipe: null,
            error: null,
            filters: {fragments: ""},
        }
    }
    render () {
        return (
            <div className="medium-container">
                <h1>Liz's Recipe Database</h1>
                <QueryForm
                    fragments={this.state.filters.fragments}
                    handleChange={this.handleFilterChange} />
                <hr />
                <ResultList items={this.state.results} handleClick={this.handleResultClick}/>
                <hr />
                <Recipe {...this.state.currentRecipe} />
                <hr />
            </div>
        )
    }

    handleFilterChange = (event) => {
        const newfilters = {...this.state.filters, [event.target.name]: event.target.value}
        const results = this.applyFilters(newfilters)
        this.setState({
            ...this.state,
            filters: newfilters,
            results: results,
        })
    }

    applyFilters = (filters) => {
        //TODO other filters
        //FIXME: make it like slackmoji search, where it can skip characters
        var results = this.state.allRecipes
        if (filters.fragments !== "") {
            results =  results.filter(recipe =>
                recipe.Title.toLowerCase().includes(filters.fragments.toLowerCase())
            );
        }
        return results
    }

    handleResultClick = (event) => {
        this.setState({
            ...this.state,
            currentRecipe: this.state.allRecipes.find((recipe) => {return recipe.ID.toString() === event.target.id}),
        })
    }

    componentDidMount() {
        fetch("http://localhost:8080/recipes/")
            .then(res => res.json())
            .then(
                (resp) => {
                    this.setState({
                        ...this.state,
                        allRecipes: resp,
                        results: resp,
                    });
                },
                (error) => {
                    alert(error);
                    this.setState({
                        ...this.state,
                        error: error,
                    });
                }
            )
    }

    sampleResults = [
        {
            ID: 23,
            Title: "Chicken Pot Pie",
            tags: ['chicken', 'main', 'soup/stew'],
            instructions: "1 Chicken\n3 cups water\nSpices"
        },
        {
            ID: 42,
            Title: "Decadent Cake",
            tags: ['dessert', 'cake', 'baking'],
            instructions: "Preheat oven to 350\nEmpty box into bowl\nMix in 3 eggs\nBake for 40 min",
        },
    ]
}

export default App;
