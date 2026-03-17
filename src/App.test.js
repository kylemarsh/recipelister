import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "./App";
import { Recipe, NewRecipeForm } from "./Recipe";
import ResultList from "./ResultList";
import * as Util from "./Util";

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
          isAdmin={true}
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
          isAdmin={true}
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

    // Verify toggle structure exists
    const toggleContainer = div.querySelector('.toggle-container');
    expect(toggleContainer).toBeTruthy();

    const track = div.querySelector('.toggle-track');
    expect(track).toBeTruthy();

    const circle = div.querySelector('.toggle-circle');
    expect(circle).toBeTruthy();

    // Verify checkbox state
    const checkbox = div.querySelector('.toggle-checkbox');
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(false);

    // Verify both text labels exist with correct classes
    const offLabel = div.querySelector('.toggle-text-off');
    const onLabel = div.querySelector('.toggle-text-on');
    expect(offLabel).toBeTruthy();
    expect(offLabel.textContent).toBe("I haven't tried this yet");
    expect(onLabel).toBeTruthy();
    expect(onLabel.textContent).toBe("I've tried it!");

    // Note: CSS controls visibility; toggle-text-off is visible when unchecked
    // (In browser, toggle-text-on would have display:none via CSS)

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

    // Verify toggle structure
    const toggleContainer = div.querySelector('.toggle-container');
    expect(toggleContainer).toBeTruthy();

    // Verify checkbox state
    const checkbox = div.querySelector('.toggle-checkbox');
    expect(checkbox.checked).toBe(true);

    // Verify both text labels exist with correct classes
    const offLabel = div.querySelector('.toggle-text-off');
    const onLabel = div.querySelector('.toggle-text-on');
    expect(offLabel).toBeTruthy();
    expect(offLabel.textContent).toBe("I haven't tried this yet");
    expect(onLabel).toBeTruthy();
    expect(onLabel.textContent).toBe("I've tried it!");

    // Note: CSS controls visibility; toggle-text-on is visible when checked
    // (In browser, toggle-text-off would have display:none via CSS)

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

    // Verify checkbox state
    const checkbox = div.querySelector('.toggle-checkbox');
    expect(checkbox.checked).toBe(false);

    // Verify text label shows OFF state
    expect(div.textContent).toContain("I haven't tried this yet");

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

    // Verify checkbox state
    const checkbox = div.querySelector('.toggle-checkbox');
    expect(checkbox.checked).toBe(false);

    // Verify text label
    expect(div.textContent).toContain("I haven't tried this yet");

    act(() => {
      root.unmount();
    });
  });
});

describe('Toggle form submission', () => {
  test('checked toggle omits new field from FormData', () => {
    // Simulate FormData with checked checkbox
    const formData = new FormData();
    formData.set('title', 'Test Recipe');
    formData.set('new', 'on');

    // Apply transformation logic from production code
    Util.transformNewField(formData);

    // Verify field is omitted
    expect(formData.has('new')).toBe(false);
    expect(formData.get('title')).toBe('Test Recipe');
  });

  test('unchecked toggle sends new=1 in FormData', () => {
    // Simulate FormData with unchecked checkbox
    const formData = new FormData();
    formData.set('title', 'Test Recipe');
    // 'new' field not present (unchecked)

    // Apply transformation logic from production code
    Util.transformNewField(formData);

    // Verify new=1 is added
    expect(formData.get('new')).toBe('1');
    expect(formData.get('title')).toBe('Test Recipe');
  });
});

describe('ResultList new indicator', () => {
  const mockHandlers = {
    handleClick: jest.fn()
  };

  test('displays bullet point for new recipes', () => {
    const recipes = [
      { ID: 1, Title: 'New Recipe', New: true },
      { ID: 2, Title: 'Old Recipe', New: false }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('• New Recipe');
    expect(div.textContent).toContain('Old Recipe');
    expect(div.textContent).not.toContain('• Old Recipe');
    act(() => {
      root.unmount();
    });
  });

  test('does not display bullet when New is undefined', () => {
    const recipes = [
      { ID: 3, Title: 'Recipe Without Field' }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('Recipe Without Field');
    expect(div.textContent).not.toContain('•');
    act(() => {
      root.unmount();
    });
  });
});

describe('Recipe New Indicator - Integration', () => {
  test('new recipe shows all indicators throughout app', () => {
    const newRecipe = {
      ID: 1,
      Title: 'Fresh Recipe',
      New: true,
      ActiveTime: 15,
      Time: 30,
      Body: 'Test recipe body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);

    act(() => {
      root.render(
        <ResultList
          items={[newRecipe]}
          sortBy="alphabetic"
          shuffleKeys={{}}
          handleClick={jest.fn()}
        />
      );
    });

    // Should show bullet in list
    expect(div.textContent).toContain('• Fresh Recipe');

    act(() => {
      root.unmount();
    });

    // Now test Recipe component
    const div2 = document.createElement("div");
    const root2 = createRoot(div2);

    act(() => {
      root2.render(
        <Recipe
          loggedIn={true}
          isAdmin={true}
          recipes={[newRecipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          recipeHandlers={{ EditClick: jest.fn(), UntargetClick: jest.fn(), DeleteClick: jest.fn() }}
          noteHandlers={{}}
          labelHandlers={{}}
        />
      );
    });

    // Should show (New!) in title
    expect(div2.textContent).toContain('Fresh Recipe (New!)');

    act(() => {
      root2.unmount();
    });
  });

  test('tried recipe shows no indicators', () => {
    const triedRecipe = {
      ID: 2,
      Title: 'Old Recipe',
      New: false,
      ActiveTime: 15,
      Time: 30,
      Body: 'Test recipe body',
      Labels: []
    };

    const div = document.createElement("div");
    const root = createRoot(div);

    act(() => {
      root.render(
        <ResultList
          items={[triedRecipe]}
          sortBy="alphabetic"
          shuffleKeys={{}}
          handleClick={jest.fn()}
        />
      );
    });

    // Should NOT show bullet in list
    expect(div.textContent).toContain('Old Recipe');
    expect(div.textContent).not.toContain('•');

    act(() => {
      root.unmount();
    });

    // Now test Recipe component
    const div2 = document.createElement("div");
    const root2 = createRoot(div2);

    act(() => {
      root2.render(
        <Recipe
          loggedIn={true}
          isAdmin={true}
          recipes={[triedRecipe]}
          availableLabels={[]}
          targetRecipeId={2}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          recipeHandlers={{ EditClick: jest.fn(), UntargetClick: jest.fn(), DeleteClick: jest.fn() }}
          noteHandlers={{}}
          labelHandlers={{}}
        />
      );
    });

    // Should NOT show (New!) in title
    expect(div2.textContent).toContain('Old Recipe');
    expect(div2.textContent).not.toContain('(New!)');

    act(() => {
      root2.unmount();
    });
  });
});

describe('ResultList label icons', () => {
  const mockHandlers = {
    handleClick: jest.fn()
  };

  test('displays icons for labels that have Icon field', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'Chicken Soup',
        Labels: [
          { ID: 1, Label: 'Chicken', Icon: '🐓' },
          { ID: 2, Label: 'SoupStew', Icon: '🍜' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('Chicken Soup');
    expect(div.textContent).toContain('🐓');
    expect(div.textContent).toContain('🍜');

    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(2);
    expect(icons[0].getAttribute('title')).toBe('Chicken');
    expect(icons[1].getAttribute('title')).toBe('SoupStew');

    act(() => {
      root.unmount();
    });
  });

  test('skips labels without Icon field', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'Test Recipe',
        Labels: [
          { ID: 1, Label: 'HasIcon', Icon: '🍕' },
          { ID: 2, Label: 'NoIcon', Icon: null },
          { ID: 3, Label: 'EmptyIcon', Icon: '' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('🍕');
    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(1);
    expect(icons[0].textContent).toBe('🍕');

    act(() => {
      root.unmount();
    });
  });

  test('handles recipes without labels', () => {
    const recipes = [
      { ID: 1, Title: 'No Labels Recipe', Labels: [] },
      { ID: 2, Title: 'Undefined Labels Recipe' }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('No Labels Recipe');
    expect(div.textContent).toContain('Undefined Labels Recipe');
    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(0);

    act(() => {
      root.unmount();
    });
  });

  test('displays icons after New indicator', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'New Recipe',
        New: true,
        Labels: [
          { ID: 1, Label: 'Test', Icon: '🧪' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          {...mockHandlers}
        />
      );
    });

    expect(div.textContent).toContain('• New Recipe');
    expect(div.textContent).toContain('🧪');
    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(1);

    act(() => {
      root.unmount();
    });
  });
});

describe('getGroupingLabels with type filtering', () => {
  test('filters labels by Type field', () => {
    const labels = [
      { ID: 1, Label: 'Main', Type: 'Course' },
      { ID: 2, Label: 'Dessert', Type: 'Course' },
      { ID: 3, Label: 'Chicken', Type: 'Protein' },
      { ID: 4, Label: 'Mexican', Type: 'Cuisine' },
    ];

    const courseLabels = Util.getGroupingLabels(labels, 'Course');
    expect(courseLabels).toEqual(['Main', 'Dessert']);

    const proteinLabels = Util.getGroupingLabels(labels, 'Protein');
    expect(proteinLabels).toEqual(['Chicken']);
  });

  test('returns empty array when groupBy is empty string', () => {
    const labels = [
      { ID: 1, Label: 'Main', Type: 'Course' },
    ];

    const result = Util.getGroupingLabels(labels, '');
    expect(result).toEqual([]);
  });

  test('returns empty array when no labels match type', () => {
    const labels = [
      { ID: 1, Label: 'Main', Type: 'Course' },
    ];

    const result = Util.getGroupingLabels(labels, 'nonexistent');
    expect(result).toEqual([]);
  });

  test('handles labels without Type field', () => {
    const labels = [
      { ID: 1, Label: 'Main', Type: 'Course' },
      { ID: 2, Label: 'Notype' }, // missing Type
    ];

    const result = Util.getGroupingLabels(labels, 'Course');
    expect(result).toEqual(['Main']);
  });
});

describe('getAvailableTypes', () => {
  test('extracts unique types from labels', () => {
    const labels = [
      { ID: 1, Label: 'Main', Type: 'Course' },
      { ID: 2, Label: 'Dessert', Type: 'Course' },
      { ID: 3, Label: 'Chicken', Type: 'Protein' },
      { ID: 4, Label: 'Mexican', Type: 'Cuisine' },
    ];

    const result = Util.getAvailableTypes(labels);
    expect(result).toEqual(['Course', 'Protein', 'Cuisine']);
  });

  test('puts Course first when present', () => {
    const labels = [
      { ID: 1, Label: 'Chicken', Type: 'Protein' },
      { ID: 2, Label: 'Mexican', Type: 'Cuisine' },
      { ID: 3, Label: 'Main', Type: 'Course' },
    ];

    const result = Util.getAvailableTypes(labels);
    expect(result[0]).toBe('Course');
    expect(result).toContain('Protein');
    expect(result).toContain('Cuisine');
  });

  test('filters out undefined and null types', () => {
    const labels = [
      { ID: 1, Label: 'Main', Type: 'Course' },
      { ID: 2, Label: 'Notype' }, // missing Type
      { ID: 3, Label: 'Nulltype', Type: null },
    ];

    const result = Util.getAvailableTypes(labels);
    expect(result).toEqual(['Course']);
  });

  test('returns empty array when no labels have types', () => {
    const labels = [
      { ID: 1, Label: 'Notype1' },
      { ID: 2, Label: 'Notype2' },
    ];

    const result = Util.getAvailableTypes(labels);
    expect(result).toEqual([]);
  });

  test('returns empty array for empty label list', () => {
    const result = Util.getAvailableTypes([]);
    expect(result).toEqual([]);
  });
});

describe('formatLabelsForDisplay', () => {
  test('title-cases Label field', () => {
    const labels = [
      { ID: 1, Label: 'chicken', Type: 'protein' },
      { ID: 2, Label: 'MEXICAN', Type: 'cuisine' },
      { ID: 3, Label: 'gluten free', Type: 'dietary' },
    ];

    const result = Util.formatLabelsForDisplay(labels);
    expect(result[0].Label).toBe('Chicken');
    expect(result[1].Label).toBe('Mexican');
    expect(result[2].Label).toBe('Gluten Free');
  });

  test('title-cases Type field', () => {
    const labels = [
      { ID: 1, Label: 'chicken', Type: 'protein' },
      { ID: 2, Label: 'mexican', Type: 'cuisine' },
    ];

    const result = Util.formatLabelsForDisplay(labels);
    expect(result[0].Type).toBe('Protein');
    expect(result[1].Type).toBe('Cuisine');
  });

  test('handles labels without Type field', () => {
    const labels = [
      { ID: 1, Label: 'no type' },
      { ID: 2, Label: 'also no type', Type: null },
    ];

    const result = Util.formatLabelsForDisplay(labels);
    expect(result[0].Label).toBe('No Type');
    expect(result[0].Type).toBeUndefined();
    expect(result[1].Label).toBe('Also No Type');
    expect(result[1].Type).toBeNull();
  });

  test('preserves other label fields', () => {
    const labels = [
      { ID: 1, Label: 'chicken', Type: 'protein', Icon: '🐔' },
    ];

    const result = Util.formatLabelsForDisplay(labels);
    expect(result[0].ID).toBe(1);
    expect(result[0].Icon).toBe('🐔');
  });

  test('normalizes whitespace in labels', () => {
    const labels = [
      { ID: 1, Label: 'gluten  free', Type: 'dietary  restriction' },
    ];

    const result = Util.formatLabelsForDisplay(labels);
    expect(result[0].Label).toBe('Gluten Free');
    expect(result[0].Type).toBe('Dietary Restriction');
  });
});

describe('sortLabelsForMultiselect', () => {
  test('sorts labels alphabetically within each type', () => {
    const labels = [
      { ID: 1, Label: 'Dessert', Type: 'Course' },
      { ID: 2, Label: 'Main', Type: 'Course' },
      { ID: 3, Label: 'Beef', Type: 'Protein' },
      { ID: 4, Label: 'Chicken', Type: 'Protein' },
    ];

    const result = Util.sortLabelsForMultiselect(labels);

    // Course labels should be first (original order), sorted alphabetically
    expect(result[0].Label).toBe('Dessert');
    expect(result[1].Label).toBe('Main');
    // Protein labels should be second, sorted alphabetically
    expect(result[2].Label).toBe('Beef');
    expect(result[3].Label).toBe('Chicken');
  });

  test('preserves original order of type groups', () => {
    const labels = [
      { ID: 1, Label: 'Beef', Type: 'Protein' },
      { ID: 2, Label: 'Main', Type: 'Course' },
      { ID: 3, Label: 'Mexican', Type: 'Cuisine' },
      { ID: 4, Label: 'Chicken', Type: 'Protein' },
    ];

    const result = Util.sortLabelsForMultiselect(labels);

    // Types should appear in order: Protein, Course, Cuisine
    expect(result[0].Type).toBe('Protein');
    expect(result[1].Type).toBe('Protein');
    expect(result[2].Type).toBe('Course');
    expect(result[3].Type).toBe('Cuisine');
  });

  test('places labels without Type at the end with Type set to "Other"', () => {
    const labels = [
      { ID: 1, Label: 'Main', Type: 'Course' },
      { ID: 2, Label: 'Chicken', Type: 'Protein' },
      { ID: 3, Label: 'Untyped Label' },
      { ID: 4, Label: 'Another Untyped' },
    ];

    const result = Util.sortLabelsForMultiselect(labels);

    // Typed labels should come first
    expect(result[0].Label).toBe('Main');
    expect(result[1].Label).toBe('Chicken');
    // Untyped labels should come last with Type: "Other", sorted alphabetically
    expect(result[2].Label).toBe('Another Untyped');
    expect(result[2].Type).toBe('Other');
    expect(result[3].Label).toBe('Untyped Label');
    expect(result[3].Type).toBe('Other');
  });

  test('sorts untyped labels alphabetically in "Other" group', () => {
    const labels = [
      { ID: 1, Label: 'Zebra' },
      { ID: 2, Label: 'Apple' },
      { ID: 3, Label: 'Mango' },
    ];

    const result = Util.sortLabelsForMultiselect(labels);

    expect(result[0].Label).toBe('Apple');
    expect(result[0].Type).toBe('Other');
    expect(result[1].Label).toBe('Mango');
    expect(result[1].Type).toBe('Other');
    expect(result[2].Label).toBe('Zebra');
    expect(result[2].Type).toBe('Other');
  });

  test('handles empty label list', () => {
    const result = Util.sortLabelsForMultiselect([]);
    expect(result).toEqual([]);
  });

  test('handles all labels having same type', () => {
    const labels = [
      { ID: 1, Label: 'Zebra', Type: 'Course' },
      { ID: 2, Label: 'Apple', Type: 'Course' },
      { ID: 3, Label: 'Mango', Type: 'Course' },
    ];

    const result = Util.sortLabelsForMultiselect(labels);

    expect(result[0].Label).toBe('Apple');
    expect(result[1].Label).toBe('Mango');
    expect(result[2].Label).toBe('Zebra');
    expect(result.every(l => l.Type === 'Course')).toBe(true);
  });

  test('preserves other label fields', () => {
    const labels = [
      { ID: 1, Label: 'Chicken', Type: 'Protein', Icon: '🐔' },
      { ID: 2, Label: 'Beef', Type: 'Protein', Icon: '🐄' },
    ];

    const result = Util.sortLabelsForMultiselect(labels);

    expect(result[0].ID).toBe(2);
    expect(result[0].Icon).toBe('🐄');
    expect(result[1].ID).toBe(1);
    expect(result[1].Icon).toBe('🐔');
  });

  test('does not mutate original array', () => {
    const labels = [
      { ID: 1, Label: 'Zebra', Type: 'Course' },
      { ID: 2, Label: 'Apple', Type: 'Course' },
    ];
    const original = [...labels];

    Util.sortLabelsForMultiselect(labels);

    expect(labels).toEqual(original);
  });

  test('creates new label objects for untyped labels', () => {
    const labels = [
      { ID: 1, Label: 'Untyped' },
    ];

    const result = Util.sortLabelsForMultiselect(labels);

    // Should not mutate the original label
    expect(labels[0].Type).toBeUndefined();
    // Result should have Type: "Other"
    expect(result[0].Type).toBe('Other');
  });
});

describe('RecipeActions buttons', () => {
  const mockHandlers = {
    recipeHandlers: {
      EditClick: jest.fn(),
      UntargetClick: jest.fn(),
      DeleteClick: jest.fn()
    },
    noteHandlers: {},
    labelHandlers: {}
  };

  test('renders three button elements instead of spans', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
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
          isAdmin={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const buttons = div.querySelectorAll('.recipe-actions button');
    expect(buttons.length).toBe(3);

    // Verify no spans with role="img" remain
    const roleImgSpans = div.querySelectorAll('.recipe-actions span[role="img"]');
    expect(roleImgSpans.length).toBe(0);

    act(() => {
      root.unmount();
    });
  });

  test('buttons have correct CSS classes', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
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
          isAdmin={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    expect(untargetBtn.tagName).toBe('BUTTON');
    expect(untargetBtn.classList.contains('recipe-action-button')).toBe(true);

    const editBtn = div.querySelector('.recipe-edit-trigger');
    expect(editBtn.tagName).toBe('BUTTON');
    expect(editBtn.classList.contains('recipe-action-button')).toBe(true);

    const deleteBtn = div.querySelector('.recipe-delete-trigger');
    expect(deleteBtn.tagName).toBe('BUTTON');
    expect(deleteBtn.classList.contains('recipe-action-button')).toBe(true);

    act(() => {
      root.unmount();
    });
  });

  test('buttons have descriptive aria-labels', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
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
          isAdmin={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    expect(untargetBtn.getAttribute('aria-label')).toBe('Go back to recipe list');

    const editBtn = div.querySelector('.recipe-edit-trigger');
    expect(editBtn.getAttribute('aria-label')).toBe('Edit recipe');

    const deleteBtn = div.querySelector('.recipe-delete-trigger');
    expect(deleteBtn.getAttribute('aria-label')).toBe('Delete recipe');

    act(() => {
      root.unmount();
    });
  });

  test('buttons have updated icons', () => {
    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
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
          isAdmin={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          {...mockHandlers}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    expect(untargetBtn.textContent).toBe('←');

    const editBtn = div.querySelector('.recipe-edit-trigger');
    expect(editBtn.textContent).toBe('✎');

    const deleteBtn = div.querySelector('.recipe-delete-trigger');
    expect(deleteBtn.textContent).toBe('🗑');

    act(() => {
      root.unmount();
    });
  });

  test('buttons trigger correct handlers', () => {
    const handlers = {
      EditClick: jest.fn(),
      UntargetClick: jest.fn(),
      DeleteClick: jest.fn()
    };

    const recipe = {
      ID: 1,
      Title: 'Test Recipe',
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
          isAdmin={true}
          recipes={[recipe]}
          availableLabels={[]}
          targetRecipeId={1}
          showTaggingForm={false}
          showNoteEditor={false}
          showAddNote={false}
          recipeHandlers={handlers}
          noteHandlers={{}}
          labelHandlers={{}}
        />
      );
    });

    const untargetBtn = div.querySelector('.recipe-untarget-trigger');
    const editBtn = div.querySelector('.recipe-edit-trigger');
    const deleteBtn = div.querySelector('.recipe-delete-trigger');

    act(() => {
      untargetBtn.click();
    });
    expect(handlers.UntargetClick).toHaveBeenCalledTimes(1);

    act(() => {
      editBtn.click();
    });
    expect(handlers.EditClick).toHaveBeenCalledTimes(1);

    act(() => {
      deleteBtn.click();
    });
    expect(handlers.DeleteClick).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });
});

describe('generateSlug', () => {
  test('converts title to lowercase with hyphens', () => {
    const result = Util.generateSlug("Mom's Chicken Soup");
    expect(result).toBe('moms-chicken-soup');
  });

  test('removes special characters', () => {
    const result = Util.generateSlug("Recipe with @special #chars!");
    expect(result).toBe('recipe-with-special-chars');
  });

  test('replaces multiple spaces with single hyphen', () => {
    const result = Util.generateSlug("Recipe  with   spaces");
    expect(result).toBe('recipe-with-spaces');
  });

  test('removes consecutive hyphens', () => {
    const result = Util.generateSlug("Recipe--with---hyphens");
    expect(result).toBe('recipe-with-hyphens');
  });

  test('trims leading and trailing hyphens', () => {
    const result = Util.generateSlug("-Recipe with edges-");
    expect(result).toBe('recipe-with-edges');
  });

  test('handles empty string', () => {
    const result = Util.generateSlug("");
    expect(result).toBe('');
  });

  test('handles string with only special characters', () => {
    const result = Util.generateSlug("@#$%");
    expect(result).toBe('');
  });

  test('preserves numbers', () => {
    const result = Util.generateSlug("Recipe 123 Test");
    expect(result).toBe('recipe-123-test');
  });

  test('handles unicode/emoji characters', () => {
    const result = Util.generateSlug("Mom's 🍗 Chicken");
    expect(result).toBe('moms-chicken');
  });
});

describe('URL routing utility functions', () => {
  describe('parseUrl', () => {
    test('extracts recipe ID from URL with slug', () => {
      const result = Util.parseUrl('/123/moms-chicken-soup');
      expect(result).toBe(123);
    });

    test('extracts recipe ID from URL without slug', () => {
      const result = Util.parseUrl('/123');
      expect(result).toBe(123);
    });

    test('returns null for root path', () => {
      const result = Util.parseUrl('/');
      expect(result).toBe(null);
    });

    test('returns null for empty path', () => {
      const result = Util.parseUrl('');
      expect(result).toBe(null);
    });

    test('returns null for invalid path', () => {
      const result = Util.parseUrl('/not-a-number/slug');
      expect(result).toBe(null);
    });

    test('handles trailing slash', () => {
      const result = Util.parseUrl('/123/');
      expect(result).toBe(123);
    });
  });

  describe('buildRecipeUrl', () => {
    test('builds URL with recipe ID and slug', () => {
      const result = Util.buildRecipeUrl(123, 'Chicken Soup');
      expect(result).toBe('/123/chicken-soup');
    });

    test('builds URL with recipe ID and empty title', () => {
      const result = Util.buildRecipeUrl(123, '');
      expect(result).toBe('/123');
    });

    test('builds URL with recipe ID and special characters', () => {
      const result = Util.buildRecipeUrl(456, "Mom's Special Recipe!");
      expect(result).toBe('/456/moms-special-recipe');
    });
  });
});

describe('Clickable tag icons in ResultList', () => {
  test('renders label icons for recipes with icon labels', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'Chicken Recipe',
        Labels: [
          { ID: 10, Label: 'Chicken', Type: 'Protein', Icon: '🐔' },
          { ID: 11, Label: 'Main', Type: 'Course', Icon: '🍽️' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          handleClick={jest.fn()}
          handleIconClick={jest.fn()}
        />
      );
    });

    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(2);
    expect(icons[0].textContent).toBe('🐔');
    expect(icons[0].getAttribute('title')).toBe('Chicken');
    expect(icons[1].textContent).toBe('🍽️');
    expect(icons[1].getAttribute('title')).toBe('Main');

    act(() => {
      root.unmount();
    });
  });

  test('clicking icon calls handleIconClick with correct label', () => {
    const handleIconClick = jest.fn();
    const recipes = [
      {
        ID: 1,
        Title: 'Test Recipe',
        Labels: [
          { ID: 10, Label: 'Chicken', Type: 'Protein', Icon: '🐔' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          handleClick={jest.fn()}
          handleIconClick={handleIconClick}
        />
      );
    });

    const icon = div.querySelector('.recipe-icon');
    act(() => {
      icon.click();
    });

    expect(handleIconClick).toHaveBeenCalledTimes(1);
    // Verify it was called with an event and the label object
    expect(handleIconClick.mock.calls[0][1]).toEqual({
      ID: 10,
      Label: 'Chicken',
      Type: 'Protein',
      Icon: '🐔'
    });

    act(() => {
      root.unmount();
    });
  });

  test('clicking icon does not trigger recipe selection', () => {
    const handleClick = jest.fn();
    const handleIconClick = jest.fn((e) => e.stopPropagation());
    const recipes = [
      {
        ID: 1,
        Title: 'Test Recipe',
        Labels: [
          { ID: 10, Label: 'Chicken', Type: 'Protein', Icon: '🐔' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          handleClick={handleClick}
          handleIconClick={handleIconClick}
        />
      );
    });

    const icon = div.querySelector('.recipe-icon');
    act(() => {
      icon.click();
    });

    expect(handleIconClick).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  test('does not render icons for labels without Icon field', () => {
    const recipes = [
      {
        ID: 1,
        Title: 'Test Recipe',
        Labels: [
          { ID: 10, Label: 'Chicken', Type: 'Protein' }, // No Icon field
          { ID: 11, Label: 'Main', Type: 'Course', Icon: '🍽️' }
        ]
      }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          handleClick={jest.fn()}
          handleIconClick={jest.fn()}
        />
      );
    });

    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(1);
    expect(icons[0].textContent).toBe('🍽️');

    act(() => {
      root.unmount();
    });
  });

  test('handles recipes with no labels', () => {
    const recipes = [
      { ID: 1, Title: 'Recipe Without Labels' }
    ];

    const div = document.createElement("div");
    const root = createRoot(div);
    act(() => {
      root.render(
        <ResultList
          items={recipes}
          sortBy="alphabetic"
          shuffleKeys={{}}
          handleClick={jest.fn()}
          handleIconClick={jest.fn()}
        />
      );
    });

    const icons = div.querySelectorAll('.recipe-icon');
    expect(icons.length).toBe(0);
    expect(div.textContent).toContain('Recipe Without Labels');

    act(() => {
      root.unmount();
    });
  });
});
