import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "./App";
import { Recipe } from "./Recipe";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  act(() => {
    root.render(<App />);
  });
  act(() => {
    root.unmount();
  });
});

describe('Recipe new indicator', () => {
  const mockHandlers = {
    recipeHandlers: { EditClick: jest.fn(), UntargetClick: jest.fn(), DeleteClick: jest.fn() },
    noteHandlers: {},
    labelHandlers: {}
  };

  test('displays "(New!)" for untried recipes', () => {
    const newRecipe = {
      ID: 1,
      Title: 'Test Recipe',
      New: true,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <Recipe
          loggedIn={true}
          recipes={[newRecipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('Test Recipe (New!)');
    act(() => {
      root.unmount();
    });
  });

  test('does not display "(New!)" for tried recipes', () => {
    const triedRecipe = {
      ID: 2,
      Title: 'Tried Recipe',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Test body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <Recipe
          loggedIn={true}
          recipes={[triedRecipe]}
          availableLabels={[]}
          targetRecipeId={2}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('Tried Recipe');
    expect(div.textContent).not.toContain('(New!)');
    act(() => {
      root.unmount();
    });
  });
});
