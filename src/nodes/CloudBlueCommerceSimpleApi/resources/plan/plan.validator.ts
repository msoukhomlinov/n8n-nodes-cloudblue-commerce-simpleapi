/**
 * @file Plan Resource Validator
 * @description Validation logic for Plan resource operations
 * Implements:
 * - Operation validation
 * - Parameter validation
 * - Input validation
 * - Billing model validation
 * - Period type validation
 * - Billing policy validation
 *
 * @module CloudBlueCommerceSimpleApi/resources/plan
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { debugLog } from '../../utils/debug';
import { BillingModel, BillingPolicy, PeriodType, WhenEffective } from './plan.types';

export class PlanValidator {
  private static instance: PlanValidator;

  public static getInstance(): PlanValidator {
    if (!PlanValidator.instance) {
      PlanValidator.instance = new PlanValidator();
    }
    return PlanValidator.instance;
  }

  /**
   * Validates the get operation parameters
   */
  public validateGetOperation(executeFunctions: IExecuteFunctions, i: number): void {
    const planId = executeFunctions.getNodeParameter('id', i) as string;
    if (!planId) {
      throw new Error('Plan ID is required for get operation');
    }

    debugLog('RESOURCE_EXEC', 'Validated get operation', { planId });
  }

  /**
   * Validates the getMany operation parameters
   */
  public validateGetManyOperation(executeFunctions: IExecuteFunctions, i: number): void {
    const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
    if (!returnAll) {
      const limit = executeFunctions.getNodeParameter('limit', i) as number;
      if (limit < 1) {
        throw new Error('Limit must be greater than 0');
      }
    }

    debugLog('RESOURCE_EXEC', 'Validated getMany operation', { returnAll });
  }

  /**
   * Validates operation parameters based on operation type
   */
  public validateOperation(
    operation: string,
    executeFunctions: IExecuteFunctions,
    i: number,
  ): void {
    debugLog('RESOURCE_EXEC', 'Validating operation', { operation });

    switch (operation) {
      case 'get':
        this.validateGetOperation(executeFunctions, i);
        break;
      case 'getMany':
        this.validateGetManyOperation(executeFunctions, i);
        break;
      default:
        throw new Error(`Operation ${operation} is not supported`);
    }
  }

  /**
   * Validates billing model
   */
  private validateBillingModel(model: string): void {
    const validModels = Object.values(BillingModel);
    if (!validModels.includes(model as BillingModel)) {
      throw new Error(`Invalid billing model: ${model}. Must be one of: ${validModels.join(', ')}`);
    }
  }

  /**
   * Validates period type
   */
  private validatePeriodType(type: string): void {
    const validTypes = Object.values(PeriodType);
    if (!validTypes.includes(type as PeriodType)) {
      throw new Error(`Invalid period type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validates billing policy
   */
  private validateBillingPolicy(policy: string): void {
    const validPolicies = Object.values(BillingPolicy);
    if (!validPolicies.includes(policy as BillingPolicy)) {
      throw new Error(
        `Invalid billing policy: ${policy}. Must be one of: ${validPolicies.join(', ')}`,
      );
    }
  }

  /**
   * Validates when effective value
   */
  private validateWhenEffective(when: string): void {
    const validValues = Object.values(WhenEffective);
    if (!validValues.includes(when as WhenEffective)) {
      throw new Error(
        `Invalid when effective value: ${when}. Must be one of: ${validValues.join(', ')}`,
      );
    }
  }

  /**
   * Validates subscription period
   */
  private validateSubscriptionPeriod(period: { type: string; duration: number }): void {
    this.validatePeriodType(period.type);

    if (typeof period.duration !== 'number' || period.duration <= 0) {
      throw new Error('Period duration must be a positive number');
    }
  }
}
