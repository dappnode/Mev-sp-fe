import { apiClient } from './client'
import { endpoints } from './config'
import {
  BlockSchema,
  ConfigSchema,
  StatusSchema,
  StatisticsSchema,
  ValidatorSchema,
  onChainProofSchema,
  registeredRelaysSchema,
} from './schemas'
import { AxiosError } from 'axios'
import { convertKeysToCamelCase } from '@/utils/case'

export const validateServerStatus = async () => {
  try {
    await apiClient.get(endpoints.status)
    return { ready: true }
  } catch (error) {
    const axiosError = error as AxiosError

    if (axiosError.response) {
      console.error(axiosError.response.status, axiosError.response.data)
      if (axiosError.response.status === 503) {
        return { ready: false }
      }
    } else if (axiosError.request) {
      console.error('No response from server', axiosError.request)
      return { ready: false }
    } else {
      console.error('Error', axiosError.message)
    }

    return { ready: false }
  }
}

export const fetchConfig = async () => {
  const response = await apiClient.get(endpoints.config)
  return ConfigSchema.parse(convertKeysToCamelCase(response.data))
}

export const fetchValidatorsByDepositor = async (
  address: `0x${string}` | undefined
) => {
  const response = await apiClient.get(
    endpoints.memoryValidators(address || '0x0')
  )
  return ValidatorSchema.array().parse(convertKeysToCamelCase(response.data))
}

export const fetchValidatorByIndex = async (index: number) => {
  const response = await apiClient.get(endpoints.memoryValidator(index))
  return ValidatorSchema.parse(convertKeysToCamelCase(response.data))
}

export const fetchAllBlocks = async () => {
  const response = await apiClient.get(endpoints.allBlocks)
  return BlockSchema.array().parse(convertKeysToCamelCase(response.data))
}

export const fetchProposedBlocks = async () => {
  const response = await apiClient.get(endpoints.proposedBlocks)
  return BlockSchema.array().parse(convertKeysToCamelCase(response.data))
}

export const fetchStatus = async () => {
  const response = await apiClient.get(endpoints.status)
  return StatusSchema.parse(convertKeysToCamelCase(response.data))
}

export const fetchStatistics = async () => {
  try {
    const response = await apiClient.get(endpoints.statistics);
    console.log(response.data)
    const convertedData = convertKeysToCamelCase(response.data);
    console.log(convertedData)
    const parsedData = StatisticsSchema.parse(convertedData);
    return parsedData;
  } catch (e) {
    console.log(e);
    // Handle the error or return a default value if needed
    return null; // For example, return null in case of an error
  }
};


export const fetchOnChainProof = async (address: `0x${string}` | undefined) => {
  const response = await apiClient.get(endpoints.onchainProof(address || '0x0'))
  return onChainProofSchema.parse(convertKeysToCamelCase(response.data))
}

export const fetchValidatorRegisteredRelays = async (
  validatorKey: `0x${string}`
) => {
  const response = await apiClient.get(endpoints.registeredRelays(validatorKey))
  return registeredRelaysSchema.parse(convertKeysToCamelCase(response.data))
}
