import 'jasmine'
import { Column, Config } from './Typings';
import * as ColumnTasks from './ColumnTasks';
const rewire = require('rewire')

let RewireColumnTasks = rewire('./ColumnTasks')
const MockColumnTasks: typeof ColumnTasks & typeof RewireColumnTasks = <any> RewireColumnTasks

describe('ColumnTasks', () => {
  describe('stringifyColumn', () => {
    it('should handle nullable', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: true,
        optional: false,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'required'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name: jsType | null')
    })
    it('should handle not nullable', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: false,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'required'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name: jsType')
    })
    it('should handle required optionality columns with optional column', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: true,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'required'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name: jsType')
    })
    it('should handle required optionality columns with required column', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: false,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'required'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name: jsType')
    })
    it('should handle optional optionality columns with optional column', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: true,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'optional'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name?: jsType')
    })
    it('should handle required optionality columns with optional column', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: false,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'optional'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name?: jsType')
    })
    it('should handle dynamic optionality columns with required column', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: false,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'dynamic'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name: jsType')
    })
    it('should handle dynamic optionality columns with optional column', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: true,
        type: 'type'
      }
      const config: Config = {
        propertyOptionality: 'dynamic'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name?: jsType')
    })
    it('should handle null optionality columns with optional column', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        optional: true,
        type: 'type'
      }
      const config: Config = { }
      let result = ColumnTasks.stringifyColumn(mockColumn, config)
      expect(result).toEqual('name?: jsType')
    })
  })
  describe('getColumnsForTable', () => {
    it('should return all columns for a table', () => {
      const mockColumns = [
        {
          isNullable: false,
          name: 'cname',
          type: 'ctype'
        }
      ]
      const mockAdapter = {
        getAllColumns: jasmine.createSpy('getAllColumns').and.returnValue(mockColumns)
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumnSubTasks = {
        convertType: jasmine.createSpy('convertType').and.returnValue('convertedtype'),
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('columnname')
      }
      MockColumnTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnSubTasks: mockColumnSubTasks
      })(async () => {
        const db = {}
        const table = {
          name: 'name',
          schema: 'schema'
        }
        const config = {
          dialect: 'dialect'
        }
        const result = await MockColumnTasks.getColumnsForTable(db as any, table as any, config as any)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith('dialect')
        expect(mockColumnSubTasks.generateFullColumnName).toHaveBeenCalledWith('name', 'schema', 'cname')
        expect(mockColumnSubTasks).toHaveBeenCalledWith('columnname', 'ctype', config)
        expect(result).toEqual([
          {
            jsType: 'convertedtype',
            type: 'ctype',
            nullable: false,
            name: 'cname',
          }
        ])
      })
    })
  })
})