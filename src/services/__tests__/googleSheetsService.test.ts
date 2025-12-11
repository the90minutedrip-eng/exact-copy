import { describe, it, expect } from 'vitest';
import { parseProducts, calculateDiscount } from '../googleSheetsService';

const sampleCSV = `ProductName,Team,Category,Season,Price,OriginalPrice,ImageURLs,VideoURLs,Stock_XS,Stock_S,Stock_M,Stock_L,Stock_XL,Stock_XXL,LimitedEdition,Description,ShortDescription,Status,DateAdded
Classic Home Jersey,Manchester United,new season,2024-25,2499,2999,https://example.com/img1.jpg,https://example.com/vid1.mp4,5,10,15,10,5,0,no,A classic home jersey.,Clean breathable jersey.,published,2024-01-15
Away Jersey,Liverpool,retro,2023-24,1999,,https://example.com/img2.jpg,,0,0,5,5,0,0,yes,Retro away kit.,Limited edition retro.,published,2024-01-10
Draft Product,Chelsea,new season,2024-25,1499,,,,,,,,,no,Not yet live.,Draft item.,draft,2024-01-20`;

const csvWithCurrency = `ProductName,Team,Category,Season,Price,OriginalPrice,ImageURLs,VideoURLs,Stock_XS,Stock_S,Stock_M,Stock_L,Stock_XL,Stock_XXL,LimitedEdition,Description,ShortDescription,Status,DateAdded
Test Jersey,Test Team,new season,2024-25,₹2499,₹2999,https://example.com/img1.jpg,,5,10,15,10,5,0,no,Test description.,Short desc.,published,2024-01-15`;

describe('parseProducts', () => {
  it('should parse CSV and return only published products', () => {
    const products = parseProducts(sampleCSV);
    expect(products).toHaveLength(2);
    expect(products.every(p => p.status === 'published')).toBe(true);
  });

  it('should correctly parse product name and team', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].productName).toBe('Classic Home Jersey');
    expect(products[0].team).toBe('Manchester United');
  });

  it('should parse prices correctly', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].price).toBe(2499);
    expect(products[0].originalPrice).toBe(2999);
  });

  it('should handle missing originalPrice', () => {
    const products = parseProducts(sampleCSV);
    const liverpoolProduct = products.find(p => p.team === 'Liverpool');
    expect(liverpoolProduct?.originalPrice).toBeNull();
  });

  it('should parse stock correctly', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].stock).toEqual({
      XS: 5,
      S: 10,
      M: 15,
      L: 10,
      XL: 5,
      XXL: 0,
    });
  });

  it('should compute availableSizes correctly', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].availableSizes).toEqual(['XS', 'S', 'M', 'L', 'XL']);
    
    const liverpoolProduct = products.find(p => p.team === 'Liverpool');
    expect(liverpoolProduct?.availableSizes).toEqual(['M', 'L']);
  });

  it('should parse limited edition flag', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].limitedEdition).toBe(false);
    
    const liverpoolProduct = products.find(p => p.team === 'Liverpool');
    expect(liverpoolProduct?.limitedEdition).toBe(true);
  });

  it('should parse image URLs into array', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].images).toEqual(['https://example.com/img1.jpg']);
  });

  it('should parse video URLs into array', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].videos).toEqual(['https://example.com/vid1.mp4']);
    
    const liverpoolProduct = products.find(p => p.team === 'Liverpool');
    expect(liverpoolProduct?.videos).toEqual([]);
  });

  it('should build search index', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].searchIndex).toContain('classic home jersey');
    expect(products[0].searchIndex).toContain('manchester united');
    expect(products[0].searchIndex).toContain('new season');
  });

  it('should strip currency symbols from prices', () => {
    const products = parseProducts(csvWithCurrency);
    expect(products[0].price).toBe(2499);
    expect(products[0].originalPrice).toBe(2999);
  });

  it('should sort by date added (newest first)', () => {
    const products = parseProducts(sampleCSV);
    expect(products[0].dateAdded).toBe('2024-01-15');
    expect(products[1].dateAdded).toBe('2024-01-10');
  });
});

describe('calculateDiscount', () => {
  it('should calculate correct discount percentage', () => {
    expect(calculateDiscount(2499, 2999)).toBe(17);
    expect(calculateDiscount(1999, 2999)).toBe(33);
    expect(calculateDiscount(500, 1000)).toBe(50);
  });

  it('should return 0 when no discount', () => {
    expect(calculateDiscount(1000, 1000)).toBe(0);
    expect(calculateDiscount(1000, 500)).toBe(0);
  });

  it('should round to nearest integer', () => {
    expect(calculateDiscount(2100, 2999)).toBe(30);
  });
});
