describe('Login Page Test', () => {
    beforeEach(() => {
      cy.visit('https://activity-points.vercel.app/');
    });
  
    it('loads login form', () => {
      cy.contains('Sign in'); // adjust based on button or header text
    });
  
    it('logs in with valid credentials', () => {
      cy.get('.emailtest').type('230860@tkmce.ac.in');
      cy.get('.passwordtest').type('B22CSB76');
      cy.get('.loginbuttontest').click();
  
      // Confirm successful login — adjust based on what shows up
      cy.contains('Arun'); // Or something specific to the student dashboard
    });
  });
  