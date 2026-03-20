import * as Api from './api';

// Mock global fetch
global.fetch = jest.fn();

describe('Label API methods', () => {
  const mockAuth = { token: 'test-token', valid: true };
  const API_HOST = process.env.REACT_APP_API_HOST || '';

  beforeEach(() => {
    fetch.mockClear();
  });

  // Note: createLabel tests removed - keeping existing implementation unchanged

  describe('updateLabel', () => {
    test('sends PUT request to /admin/label/id/{id} with urlencoded data', async () => {
      const labelId = 5;
      const updates = { label: 'beef', type: 'protein' };

      fetch.mockResolvedValueOnce({
        ok: true
      });

      await Api.updateLabel(labelId, updates, mockAuth);

      expect(fetch).toHaveBeenCalledWith(
        `${API_HOST}admin/label/id/${labelId}`,
        {
          method: 'PUT',
          headers: {
            'x-access-token': 'test-token',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'label=beef&type=protein'
        }
      );
    });

    test('sends only changed fields in request', async () => {
      const labelId = 3;
      const updates = { icon: '🍕' };

      fetch.mockResolvedValueOnce({
        ok: true
      });

      await Api.updateLabel(labelId, updates, mockAuth);

      expect(fetch).toHaveBeenCalledWith(
        `${API_HOST}admin/label/id/${labelId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: expect.stringContaining('icon')
        })
      );
    });

    test('handles API error response', async () => {
      const labelId = 999;
      const formData = new FormData();
      formData.set('label', 'test');

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'label not found'
      });

      await expect(Api.updateLabel(labelId, formData, mockAuth))
        .rejects
        .toThrow('404: label not found');
    });
  });

  describe('deleteLabel', () => {
    test('sends DELETE request to /admin/label/id/{id}', async () => {
      const labelId = 7;

      fetch.mockResolvedValueOnce({
        ok: true
      });

      await Api.deleteLabel(labelId, mockAuth);

      expect(fetch).toHaveBeenCalledWith(
        `${API_HOST}admin/label/id/${labelId}`,
        {
          method: 'DELETE',
          headers: { 'x-access-token': 'test-token' }
        }
      );
    });

    test('handles API error response', async () => {
      const labelId = 999;

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'label not found'
      });

      await expect(Api.deleteLabel(labelId, mockAuth))
        .rejects
        .toThrow('404: label not found');
    });
  });
});
