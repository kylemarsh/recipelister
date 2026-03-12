import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "./App";
import { Recipe, NewRecipeForm } from "./Recipe";

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

describe('NewRecipeForm checkbox', () => {
  const mockHandlers = {
    handleSubmit: jest.fn(),
    handleCancel: jest.fn()
  };

  test('renders unchecked checkbox when creating new recipe', () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <NewRecipeForm
          recipeId={undefined}
          recipes={[]}
          {...mockHandlers}
        />
      );
    });

    const checkbox = div.querySelector('input[name="new"]');
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(false);
    act(() => {
      root.unmount();
    });
  });

  test('renders checked checkbox when editing tried recipe', () => {
    const triedRecipe = {
      ID: 1,
      Title: 'Test',
      New: false,
      ActiveTime: 10,
      Time: 30,
      Body: 'Body'
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <NewRecipeForm
          recipeId={1}
          recipes={[triedRecipe]}
          {...mockHandlers}
        />
      );
    });

    const checkbox = div.querySelector('input[name="new"]');
    expect(checkbox.checked).toBe(true);
    act(() => {
      root.unmount();
    });
  });

  test('renders unchecked checkbox when editing new recipe', () => {
    const newRecipe = {
      ID: 2,
      Title: 'Test',
      New: true,
      ActiveTime: 10,
      Time: 30,
      Body: 'Body'
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <NewRecipeForm
          recipeId={2}
          recipes={[newRecipe]}
          {...mockHandlers}
        />
      );
    });

    const checkbox = div.querySelector('input[name="new"]');
    expect(checkbox.checked).toBe(false);
    act(() => {
      root.unmount();
    });
  });

  test('renders unchecked checkbox when New field is undefined', () => {
    const recipeWithoutNewField = {
      ID: 3,
      Title: 'Old Recipe',
      ActiveTime: 10,
      Time: 30,
      Body: 'Body'
      // Note: No New field
    };

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <NewRecipeForm
          recipeId={3}
          recipes={[recipeWithoutNewField]}
          handleSubmit={jest.fn()}
          handleCancel={jest.fn()}
        />
      );
    });

    const checkbox = div.querySelector('input[name="new"]');
    expect(checkbox.checked).toBe(false);
    act(() => {
      root.unmount();
    });
  });
});
