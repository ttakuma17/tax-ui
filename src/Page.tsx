import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form'; 

import { Heading, HStack, Spacer, VStack } from '@chakra-ui/react';

import { FormInputs, InputForm } from './InputForm';
import { Result } from './Result';
import { CalcTaxParam, CalcTaxResult, useCalcTax } from './useCalcTax';

type PresentationProps = {
    tax: number | null
    onInputFormSubmit: SubmitHandler<FormInputs>
}

export const Page = () => {
    // TODO APIからデータを取得する 
    const [tax] = useState(10000)

    const { mutate } = useCalcTax();

    const handleInputFormSubmit = (formInputs: FormInputs) => { 
        const param: CalcTaxParam = {
            yearsOfService: Number(formInputs.yearsOfService),
            isDisability: formInputs.isDisability,
            isExecutive: !Number(formInputs.isExecutive),
            severancePay: Number(formInputs.severancePay),
        }
        mutate(param, {
            onSuccess: async (data) => { 
                if (data.ok) { 
                    const json = (await data.json()) as CalcTaxResult;
                    console.log(json);
                }
            },
        })
    }

    return <Presentation tax={tax} onInputFormSubmit={handleInputFormSubmit} />
}

export const Presentation = ({ tax, onInputFormSubmit }: PresentationProps) => (
    <VStack marginY={5} spacing={5} w="100%" minW="800px">
        <Heading>退職金の所得税計算アプリケーション</Heading>
        <HStack w="100%">
            <Spacer />
            <InputForm w="400px" h="500px" onInputFormSubmit={onInputFormSubmit} />
            <Result w="400px" h="500px" tax={tax} />
            <Spacer />
        </HStack>
    </VStack>
)