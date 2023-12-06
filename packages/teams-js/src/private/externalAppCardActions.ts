import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * Namespace to delegate adaptive card action execution to the host
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace externalAppCardActions {
  /**
   * @hidden
   * The type of deeplink action that was executed by the host
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionOpenUrlType {
    DeepLinkDialog = 'DeepLinkDialog',
    DeepLinkOther = 'DeepLinkOther',
    DeepLinkStageView = 'DeepLinkStageView',
    GenericUrl = 'GenericUrl',
  }

  /**
   * @hidden
   * Error that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ActionOpenUrlError {
    errorCode: ActionOpenUrlErrorCode;
    message?: string;
  }

  /**
   * @hidden
   * Error codes that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionOpenUrlErrorCode {
    INVALID_LINK = 'INVALID_LINK', // Deep link is invalid
    NOT_SUPPORTED = 'NOT_SUPPORTED', // Deep link is not supported
    INTERNAL_ERROR = 'INTERNAL_ERROR', // Generic error
  }

  /**
   * @hidden
   * The payload that is used when executing an Adaptive Card Action.Submit
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IAdaptiveCardActionSubmit {
    id: string;
    data: Record<string, unknown>;
  }

  /**
   * @hidden
   * The configuration for Adaptive Card Action.Submit. This indicates which subtypes of actions are supported by the calling app.
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ICardActionsConfig {
    enableImback: boolean;
    enableInvoke: boolean;
    enableDialog: boolean;
    enableStageView: boolean;
    enableSignIn: boolean;
    enableO365Submit: boolean;
  }

  /**
   *
   * @hidden
   * Error that can be thrown from IExternalAppCardActionService.handleActionSubmit
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ActionSubmitError {
    errorCode: ActionSubmitErrorCode;
    message?: string;
  }

  /**
   * @hidden
   * Error codes that can be thrown from IExternalAppCardActionService.handleActionSubmit
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionSubmitErrorCode {
    INTERNAL_ERROR = 'INTERNAL_ERROR', // Generic error
  }
  /**
   * @beta
   * @hidden
   * Delegates an Adaptive Card Action.Submit request to the host for the application with the provided app ID
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application the request is intended for
   * @param actionSubmitPayload The Adaptive Card Action.Submit payload
   * @param cardActionsConfig The card actions configuration. This indicates which subtypes should be handled by this API
   * @returns Promise that resolves when the request is completed and rejects with ActionSubmitError if the request fails
   */
  export function processActionSubmit(
    appId: string,
    actionSubmitPayload: IAdaptiveCardActionSubmit,
    cardActionsConfig: ICardActionsConfig,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return sendMessageToParentAsync<[boolean, ActionSubmitError]>('externalAppCardActions.processActionSubmit', [
      appId,
      actionSubmitPayload,
      cardActionsConfig,
    ]).then(([wasSuccessful, error]: [boolean, ActionSubmitError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  /**
   * @beta
   * @hidden
   * Delegates an Adaptive Card Action.OpenUrl request to the host for the application with the provided app ID
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application the request is intended for
   * @param url The URL to open
   * @returns Promise that resolves to ActionOpenUrlType indicating the type of URL that was opened on success and rejects with ActionOpenUrlError if the request fails
   */
  export function processActionOpenUrl(appId: string, url: string): Promise<ActionOpenUrlType> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return sendMessageToParentAsync<[ActionOpenUrlError, ActionOpenUrlType]>(
      'externalAppCardActions.processActionOpenUrl',
      [appId, url],
    ).then(([error, response]: [ActionOpenUrlError, ActionOpenUrlType]) => {
      if (error) {
        throw error;
      } else {
        return response;
      }
    });
  }

  /**
   * @hidden
   * Checks if the externalAppCardActions capability is supported by the host
   * @returns boolean to represent whether externalAppCardActions capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppCardActions ? true : false;
  }
}