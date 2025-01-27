describe('helloWorld function', () => {
    it('should return "Hello, World!"', () => {
        expect(helloWorld()).toBe('Hello, World!');
    });
});
function helloWorld(): string {
    return "Hello, World!";
}
