import { useMutation } from "@tanstack/react-query";

const calcTaxUrl = "http:localhost:8080/calc-tax"

export type CalcTaxParam = {
    yearsOfService: number,
    isDisability: boolean,
    isExecutive: boolean,
    severancePay: number
}

export type CalcResult = {
    tax:number
}

export const useCalcTax = () =>
    useMutation((param: CalcTaxParam) =>  
        fetch(calcTaxUrl, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(param),
        })
    )
