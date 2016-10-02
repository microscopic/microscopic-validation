'use strict'

const chai = require('chai')
const sinon = require('sinon')

const expect = chai.expect

const ValidationPlugin = require('../lib/validation')

describe('Validation Plugin', () => {
  describe('validate()', () => {
    it('should call next if params or params definition does not exist', (done) => {
      const request = {
        _method: {
          definition: {
            params: {
              a: (value) => value > 0 || 'Must be > 0',
              b: (value) => value < 10 || 'Must be < 10'
            }
          }
        }
      }

      ValidationPlugin.validate(request, (error) => {
        expect(error).to.be.undefined

        done()
      })
    })

    it('should return undefined if validation is ok', (done) => {
      const request = {
        params: { a: 1, b: 2 },
        _method: {
          definition: {
            params: {
              a: (value) => value > 0 || 'Must be > 0',
              b: (value) => value < 10 || 'Must be < 10'
            }
          }
        }
      }

      ValidationPlugin.validate(request, (error) => {
        expect(error).to.be.undefined

        done()
      })
    })

    it('should return error if is a problem with validation', (done) => {
      const request = {
        params: { a: 1, b: 2 },
        _method: {
          definition: {
            params: {
              a: (value) => value > 10 || 'Must be > 10',
              b: (value) => value < 10 || 'Must be < 10'
            }
          }
        }
      }

      ValidationPlugin.validate(request, (error) => {
        expect(error).to.be.instanceOf(Error)
        expect(error.message).to.be.equal('Validation Error')
        expect(error.data).to.be.deep.equal({ a: [ 'Must be > 10' ] })

        done()
      })
    })

    it('should return error if is a problem with validation (one level of nesting)', (done) => {
      const request = {
        params: { a: { a1: 1 }, b: 2 },
        _method: {
          definition: {
            params: {
              a: {
                a1: (value) => value > 10 || 'Must be > 10'
              },
              b: (value) => value < 10 || 'Must be < 10'
            }
          }
        }
      }

      ValidationPlugin.validate(request, (error) => {
        expect(error).to.be.instanceOf(Error)
        expect(error.message).to.be.equal('Validation Error')
        expect(error.data).to.be.deep.equal({ a: { a1: [ 'Must be > 10' ] } })

        done()
      })
    })

    it('should return error if is a problem with validation (two level of nesting)', (done) => {
      const request = {
        params: { a: { a1: 1, a2: { a3: 1 } }, b: 2 },
        _method: {
          definition: {
            params: {
              a: {
                a1: (value) => value > 10 || 'Must be > 10',
                a2: {
                  a3: (value) => value > 10 || 'Must be > 10'
                }
              },
              b: (value) => value < 10 || 'Must be < 10'
            }
          }
        }
      }

      ValidationPlugin.validate(request, (error) => {
        expect(error).to.be.instanceOf(Error)
        expect(error.message).to.be.equal('Validation Error')
        expect(error.data).to.be.deep.equal({ a: { a1: [ 'Must be > 10' ], a2: { a3: [ 'Must be > 10' ] } } })

        done()
      })
    })

    it('should return error if is a problem with validation (multiple validators)', (done) => {
      const request = {
        params: { a: 1, b: 2 },
        _method: {
          definition: {
            params: {
              a: [
                (value) => value > 10 || 'Must be > 10',
                (value) => value > 12 || 'Must be > 12'
              ],
              b: (value) => value < 10 || 'Must be < 10'
            }
          }
        }
      }

      ValidationPlugin.validate(request, (error) => {
        expect(error).to.be.instanceOf(Error)
        expect(error.message).to.be.equal('Validation Error')
        expect(error.data).to.be.deep.equal({ a: [ 'Must be > 10', 'Must be > 12' ] })

        done()
      })
    })
  })

  describe('register()', () => {
    it('should add onPreMethod extension to service', () => {
      const extSpy = sinon.spy()

      const service = {
        ext: extSpy
      }

      ValidationPlugin.register(service)

      expect(extSpy.calledWith('onPreMethod')).to.be.true
    })
  })
})
