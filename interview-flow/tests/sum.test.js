function sum(a, b) {
  return a + b;
}

test('soma dois números corretamente', () => {
  expect(sum(2, 3)).toBe(5);
});
