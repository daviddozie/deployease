# Contributing to DeployEase

## Setup
1. Fork and clone the repository
2. Run npm install
3. Run npm test to ensure tests pass

## Adding a New Platform
1. Create `src/platforms/yourplatform.js` extending Platform
2. Implement required methods
3. Add to `src/platforms/index.js`
4. Write tests in `tests/unit/yourplatform.test.js`
5. Update `README.md`

## Code Style
- Use async/await, not callbacks
- Add JSDoc comments to all functions
- Use logger utility for all console output
- Handle errors gracefully

## Submitting PR
- Ensure all tests pass
- Add tests for new features
