import { WAGTAIL_CONFIG } from '../config/wagtailConfig';
import { getPageChildren, getPage } from './admin';
import client from './client';

const { ADMIN_API } = WAGTAIL_CONFIG;

jest.mock('./client', () => {
  const stubResult = {
    __types: {
      test: {
        verbose_name: 'Test',
      },
    },
    items: [{ meta: { type: 'test' } }, { meta: { type: 'foo' } }],
  };

  return {
    __esModule: true,
    default: { get: jest.fn(() => Promise.resolve(stubResult)) },
  };
});

/* ******************************* Testes já presentes no projeto ******************************* */
describe('admin API', () => {
  describe('getPageChildren', () => {
    it('works', () => {
      getPageChildren(3);
      expect(client.get).toBeCalledWith(
        `${ADMIN_API.PAGES}?child_of=3&for_explorer=1&fields=parent`,
      );
    });

    it('#fields', () => {
      getPageChildren(3, { fields: ['title', 'latest_revision_created_at'] });
      expect(client.get).toBeCalledWith(
        `${ADMIN_API.PAGES}?child_of=3&for_explorer=1&fields=parent,title%2Clatest_revision_created_at`,
      );
    });

    it('#onlyWithChildren', () => {
      getPageChildren(3, { onlyWithChildren: true });
      expect(client.get).toBeCalledWith(
        `${ADMIN_API.PAGES}?child_of=3&for_explorer=1&fields=parent&has_children=1`,
      );
    });

    it('#offset', () => {
      getPageChildren(3, { offset: 5 });
      expect(client.get).toBeCalledWith(
        `${ADMIN_API.PAGES}?child_of=3&for_explorer=1&fields=parent&offset=5`,
      );
    });
  });
  /* ******************************** Novos Testes Criados ******************************** */

  describe('getPageChildren - Conditional Validations', () => {
    it('#fields and onlyWithChildren (both defined -> true)', () => {
      const result = getPageChildren(7, { fields: ['title'], onlyWithChildren: true });
      expect(client.get).toBeCalledWith(
        `${ADMIN_API.PAGES}?child_of=7&for_explorer=1&fields=parent,title&has_children=1`,
      );
      expect(result).toBeTruthy();
    });
  
    it('#fields and onlyWithChildren (fields not defined -> false)', () => {
      const result = getPageChildren(7, { onlyWithChildren: true });
      expect(result).toBeFalsy();
    });
  
    it('#fields and onlyWithChildren (onlyWithChildren not defined -> false)', () => {
      const result = getPageChildren(7, { fields: ['title'] });
      expect(result).toBeFalsy();
    });
  
    it('#fields and offset (both defined -> true)', () => {
      const result = getPageChildren(8, { fields: ['title'], offset: 20 });
      expect(client.get).toBeCalledWith(
        `${ADMIN_API.PAGES}?child_of=8&for_explorer=1&fields=parent,title&offset=20`,
      );
      expect(result).toBeTruthy();
    });
  
    it('#fields and offset (fields not defined -> false)', () => {
      const result = getPageChildren(8, { offset: 20 });
      expect(result).toBeFalsy();
    });
  
    it('#fields and offset (offset not defined -> false)', () => {
      const result = getPageChildren(8, { fields: ['title'] });
      expect(result).toBeFalsy();
    });
  
    it('#onlyWithChildren and offset (both defined -> true)', () => {
      const result = getPageChildren(9, { onlyWithChildren: true, offset: 30 });
      expect(client.get).toBeCalledWith(
        `${ADMIN_API.PAGES}?child_of=9&for_explorer=1&fields=parent&has_children=1&offset=30`,
      );
      expect(result).toBeTruthy();
    });
  
    it('#onlyWithChildren and offset (onlyWithChildren not defined -> false)', () => {
      const result = getPageChildren(9, { offset: 30 });
      expect(result).toBeFalsy();
    });
  
    it('#onlyWithChildren and offset (offset not defined -> false)', () => {
      const result = getPageChildren(9, { onlyWithChildren: true });
      expect(result).toBeFalsy();
    });
  });
  /* ******************************** Fim dos novos testes criados ********************************** */

  describe('getPage', () => {
    it('should return a result by with a default id argument', () => {
      getPage(3);
      expect(client.get).toBeCalledWith(`${ADMIN_API.PAGES}3/`);
    });
  });

  afterEach(() => {
    client.get.mockClear();
  });
});
