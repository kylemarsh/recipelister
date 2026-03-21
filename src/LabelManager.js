import React from 'react';
import * as Util from './Util';
import './LabelManager.css';

class LabelManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      collapsedGroups: new Set(), // Default: all groups expanded
      recipePanelLabel: null, // Label ID for recipe panel
      recipePanelRecipes: [], // Snapshot of recipes when panel opened
      editingLabel: null, // { labelId, field } for inline editing
      editValue: '', // Current value in edit input
      showNewLabelForm: false,
      newLabel: { label: '', type: '', icon: '' },
      deleteConfirm: null, // { labelId, labelName, usageCount } or null
    };
  }

  componentDidMount() {
    // If returning from a recipe view, re-open the recipe panel
    if (this.props.openRecipePanelForLabel) {
      this.openRecipePanel(this.props.openRecipePanelForLabel);
      // Notify parent that we've handled the return navigation
      if (this.props.onReturnHandled) {
        this.props.onReturnHandled();
      }
    }
  }

  // Filter labels by search query
  getFilteredLabels = () => {
    const query = this.state.searchQuery.toLowerCase();
    if (!query) return this.props.allLabels;

    return this.props.allLabels.filter(label =>
      label.Label.toLowerCase().includes(query) ||
      (label.Type && label.Type.toLowerCase().includes(query))
    );
  };

  // Group filtered labels by Type
  getGroupedLabels = () => {
    const filteredLabels = this.getFilteredLabels();
    const types = Util.getAvailableTypes(filteredLabels);

    const groups = {};

    // Create groups for each type (excluding empty strings)
    types.forEach(type => {
      if (type && type.trim()) { // Only create group if type is non-empty
        groups[type] = filteredLabels.filter(label => label.Type === type);
      }
    });

    // Add "Other" group for labels without Type (including empty strings)
    const noTypeLabels = filteredLabels.filter(label => !label.Type || !label.Type.trim());
    if (noTypeLabels.length > 0) {
      groups['Other'] = noTypeLabels;
    }

    return groups;
  };

  // Count recipes for a label
  getLabelUsage = (labelId) => {
    return this.props.allRecipes.filter(recipe =>
      recipe.Labels && recipe.Labels.some(l => l.ID === labelId)
    ).length;
  };

  // Get recipes for a label
  getRecipesForLabel = (labelId) => {
    return this.props.allRecipes.filter(recipe =>
      recipe.Labels && recipe.Labels.some(l => l.ID === labelId)
    );
  };

  // Toggle group expand/collapse
  handleGroupToggle = (groupName) => {
    const newCollapsedGroups = new Set(this.state.collapsedGroups);
    if (newCollapsedGroups.has(groupName)) {
      newCollapsedGroups.delete(groupName);
    } else {
      newCollapsedGroups.add(groupName);
    }
    this.setState({ collapsedGroups: newCollapsedGroups });
  };

  // Handle search input change
  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  // Start inline edit
  startEdit = (labelId, field, currentValue) => {
    this.setState({
      editingLabel: { labelId, field },
      editValue: currentValue || '',
    });
  };

  // Cancel inline edit
  cancelEdit = () => {
    this.setState({
      editingLabel: null,
      editValue: '',
    });
  };

  // Submit inline edit
  submitEdit = async (labelId, field, newValue) => {
    // Validation
    if (field === 'Label' && !newValue.trim()) {
      this.props.setAlert(new Error('Label name cannot be empty'), 'error editing label', 'editLabel');
      return;
    }

    const trimmedValue = newValue.trim();

    // Validate icon length (single grapheme only)
    if (field === 'Icon' && trimmedValue && typeof Intl.Segmenter !== 'undefined') {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      const segments = Array.from(segmenter.segment(trimmedValue));
      if (segments.length > 1) {
        this.props.setAlert(new Error('Icon must be a single character or emoji'), 'error editing label', 'editLabel');
        return;
      }
    }

    // Build object with only changed field
    const updates = { [field.toLowerCase()]: trimmedValue };

    this.props.handleLabelUpdate(labelId, updates, () => {
      this.cancelEdit();
    });
  };

  // Handle keyboard events in edit input
  handleEditKeyDown = (e, labelId, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.submitEdit(labelId, field, this.state.editValue);
    } else if (e.key === 'Escape') {
      this.cancelEdit();
    }
  };

  // Handle edit input change
  handleEditValueChange = (e) => {
    this.setState({ editValue: e.target.value });
  };

  // Delete confirmation handlers
  showDeleteConfirm = (labelId, labelName, usageCount) => {
    this.setState({
      deleteConfirm: { labelId, labelName, usageCount },
    });
  };

  cancelDelete = () => {
    this.setState({ deleteConfirm: null });
  };

  confirmDelete = () => {
    const { labelId } = this.state.deleteConfirm;
    this.props.handleLabelDelete(labelId, () => {
      this.setState({ deleteConfirm: null });
    });
  };

  // Recipe panel handlers
  openRecipePanel = (labelId) => {
    // Snapshot the recipes currently tagged with this label
    const recipesForLabel = this.getRecipesForLabel(labelId);
    this.setState({
      recipePanelLabel: labelId,
      recipePanelRecipes: recipesForLabel,
    });
  };

  closeRecipePanel = () => {
    this.setState({
      recipePanelLabel: null,
      recipePanelRecipes: [],
    });
  };

  handleUnlink = (recipeId, labelId) => {
    this.props.handleUnlinkRecipe(recipeId, labelId);
  };

  handleRelink = (recipeId, labelId) => {
    this.props.handleLinkRecipe(recipeId, labelId);
  };

  // New label form handlers
  openNewLabelForm = () => {
    this.setState({
      showNewLabelForm: true,
      newLabel: { label: '', type: '', icon: '' },
    });
  };

  cancelNewLabel = () => {
    this.setState({
      showNewLabelForm: false,
      newLabel: { label: '', type: '', icon: '' },
    });
  };

  handleNewLabelChange = (field, value) => {
    this.setState({
      newLabel: { ...this.state.newLabel, [field]: value },
    });
  };

  submitNewLabel = () => {
    const { label, type, icon } = this.state.newLabel;

    if (!label.trim()) {
      this.props.setAlert(new Error('Label name is required'), 'error creating label', 'addLabel');
      return;
    }

    // Validate icon length (single grapheme only)
    const trimmedIcon = icon.trim();
    if (trimmedIcon && typeof Intl.Segmenter !== 'undefined') {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      const segments = Array.from(segmenter.segment(trimmedIcon));
      if (segments.length > 1) {
        this.props.setAlert(new Error('Icon must be a single character or emoji'), 'error creating label', 'addLabel');
        return;
      }
    }

    this.props.handleLabelCreate(
      { label: label.trim(), type: type.trim(), icon: trimmedIcon },
      () => {
        this.cancelNewLabel();
      }
    );
  };

  render() {
    const groupedLabels = this.getGroupedLabels();
    const groupNames = Object.keys(groupedLabels);

    return (
      <div className="label-manager">
        <div className="label-manager-header">
          <button
            className="back-button"
            onClick={this.props.handleBack}
            aria-label="Back to recipe list"
          >
            ←
          </button>
          <h2>Manage Labels</h2>
        </div>

        <div className="label-manager-controls">
          <input
            type="text"
            className="label-search"
            placeholder="Search labels..."
            value={this.state.searchQuery}
            onChange={this.handleSearchChange}
          />
          <button
            className="new-label-button"
            onClick={this.openNewLabelForm}
          >
            New Label
          </button>
        </div>

        <div className="label-manager-content">
          {/* New Label Form */}
          {this.state.showNewLabelForm && (
            <div className="new-label-form">
              <h3>New Label</h3>
              <div className="form-row">
                <label>Label:</label>
                <input
                  type="text"
                  value={this.state.newLabel.label}
                  onChange={(e) => this.handleNewLabelChange('label', e.target.value)}
                  placeholder="Label name (required)"
                />
              </div>
              <div className="form-row">
                <label>Type:</label>
                <input
                  type="text"
                  value={this.state.newLabel.type}
                  onChange={(e) => this.handleNewLabelChange('type', e.target.value)}
                  placeholder="Type (optional)"
                />
              </div>
              <div className="form-row">
                <label>Icon:</label>
                <input
                  type="text"
                  value={this.state.newLabel.icon}
                  onChange={(e) => this.handleNewLabelChange('icon', e.target.value)}
                  placeholder="Icon (optional)"
                />
              </div>
              <div className="form-buttons">
                <button
                  className="form-button form-button-cancel"
                  onClick={this.cancelNewLabel}
                >
                  ✗ Cancel
                </button>
                <button
                  className="form-button form-button-submit"
                  onClick={this.submitNewLabel}
                >
                  ✓ Create
                </button>
              </div>
            </div>
          )}
          {groupNames.length === 0 ? (
            <p className="no-labels">No labels found</p>
          ) : (
            groupNames.map(groupName => {
              const labels = groupedLabels[groupName];
              const isExpanded = !this.state.collapsedGroups.has(groupName);

              return (
                <div key={groupName} className="label-group">
                  <div
                    className="label-group-header"
                    onClick={() => this.handleGroupToggle(groupName)}
                  >
                    <span className="expand-indicator">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="group-name">{groupName}</span>
                    <span className="group-count">({labels.length})</span>
                  </div>

                  {isExpanded && (
                    <div className="label-list">
                      {labels.map(label => {
                        const usage = this.getLabelUsage(label.ID);
                        const isEditingThis = this.state.editingLabel?.labelId === label.ID;

                        return (
                          <div key={label.ID} className="label-row">
                            {/* Label Name */}
                            <div className="label-field label-name">
                              {isEditingThis && this.state.editingLabel.field === 'Label' ? (
                                <input
                                  ref={(input) => input && input.focus()}
                                  type="text"
                                  className="inline-edit-input"
                                  value={this.state.editValue}
                                  onChange={this.handleEditValueChange}
                                  onKeyDown={(e) => this.handleEditKeyDown(e, label.ID, 'Label')}
                                  onBlur={() => this.submitEdit(label.ID, 'Label', this.state.editValue)}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="editable-field"
                                  onClick={() => !isEditingThis && this.startEdit(label.ID, 'Label', label.Label)}
                                >
                                  {label.Label}
                                </span>
                              )}
                            </div>

                            {/* Type */}
                            <div className="label-field label-type">
                              {isEditingThis && this.state.editingLabel.field === 'Type' ? (
                                <input
                                  ref={(input) => input && input.focus()}
                                  type="text"
                                  className="inline-edit-input"
                                  value={this.state.editValue}
                                  onChange={this.handleEditValueChange}
                                  onKeyDown={(e) => this.handleEditKeyDown(e, label.ID, 'Type')}
                                  onBlur={() => this.submitEdit(label.ID, 'Type', this.state.editValue)}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="editable-field"
                                  onClick={() => !isEditingThis && this.startEdit(label.ID, 'Type', label.Type)}
                                >
                                  {label.Type || '—'}
                                </span>
                              )}
                            </div>

                            {/* Icon */}
                            <div className="label-field label-icon">
                              {isEditingThis && this.state.editingLabel.field === 'Icon' ? (
                                <input
                                  ref={(input) => input && input.focus()}
                                  type="text"
                                  className="inline-edit-input"
                                  value={this.state.editValue}
                                  onChange={this.handleEditValueChange}
                                  onKeyDown={(e) => this.handleEditKeyDown(e, label.ID, 'Icon')}
                                  onBlur={() => this.submitEdit(label.ID, 'Icon', this.state.editValue)}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="editable-field"
                                  onClick={() => !isEditingThis && this.startEdit(label.ID, 'Icon', label.Icon)}
                                >
                                  {label.Icon || '—'}
                                </span>
                              )}
                            </div>

                            {/* Usage Count */}
                            <div className="label-field label-usage">
                              <span
                                className="usage-count"
                                onClick={() => this.openRecipePanel(label.ID)}
                              >
                                {usage}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="label-actions">
                              <button
                                className="delete-label-button"
                                onClick={() => this.setState({
                                  deleteConfirm: {
                                    labelId: label.ID,
                                    labelName: label.Label,
                                    usageCount: usage
                                  }
                                })}
                                aria-label="Delete label"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {this.state.deleteConfirm && (
          <div className="modal-overlay" onClick={this.cancelDelete}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Label</h3>
              <p>
                Delete "{this.state.deleteConfirm.labelName}"? This will unlink it from{' '}
                {this.state.deleteConfirm.usageCount} recipe(s).
              </p>
              <div className="modal-buttons">
                <button
                  className="modal-button modal-button-cancel"
                  onClick={this.cancelDelete}
                >
                  Cancel
                </button>
                <button
                  className="modal-button modal-button-confirm"
                  onClick={this.confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Association Panel */}
        {this.state.recipePanelLabel && (
          <div className="recipe-panel-overlay">
            <div className="recipe-panel-header">
              <h3>
                Recipes tagged with "
                {this.props.allLabels.find(l => l.ID === this.state.recipePanelLabel)?.Label}
                "
              </h3>
              <button
                className="recipe-panel-close"
                onClick={this.closeRecipePanel}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>
            <div className="recipe-panel-content">
              {this.state.recipePanelRecipes.map(recipe => {
                // Check if recipe is currently linked by checking current allRecipes
                const currentRecipe = this.props.allRecipes.find(r => r.ID === recipe.ID);
                const isCurrentlyLinked = currentRecipe?.Labels?.some(l => l.ID === this.state.recipePanelLabel);

                return (
                  <div
                    key={recipe.ID}
                    className={`recipe-panel-item ${!isCurrentlyLinked ? 'unlinked' : ''}`}
                  >
                    <span
                      className="link-icon"
                      onClick={() => {
                        if (isCurrentlyLinked) {
                          this.handleUnlink(recipe.ID, this.state.recipePanelLabel);
                        } else {
                          this.handleRelink(recipe.ID, this.state.recipePanelLabel);
                        }
                      }}
                      title={isCurrentlyLinked ? 'Unlink recipe' : 'Re-link recipe'}
                    >
                      {isCurrentlyLinked ? '🔗' : '⛓️‍💥'}
                    </span>
                    <span
                      className="recipe-title"
                      onClick={() => this.props.handleRecipeClick(recipe.ID, this.state.recipePanelLabel)}
                    >
                      {recipe.Title}
                    </span>
                  </div>
                );
              })}
              {this.state.recipePanelRecipes.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999' }}>
                  No recipes tagged with this label
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default LabelManager;
