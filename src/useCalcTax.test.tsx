import { act, waitFor } from '@testing-library/react'

import { renderHook } from './test-utils'
import { useCalcTax } from './useCalcTax'

describe("useCalcTax", () => { 
    it("所得税計算APIを呼び出せること", async () => { 
        // Hooksをレンダリングしておく
        const { result } = renderHook(() => useCalcTax());

        // Hooksから返却されたmutate関数を使用してAPIを呼び出し
        act(() => { 
            result.current.mutate({
                yearsOfService: 6,
                isExecutive: false,
                isDisability: false,
                severancePay: 3000000,
            })
        })

        // Hooksの結果が成功になるまで待つ
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // ステータスコードとレスポンスボディのJSONデータを確認
        expect(result.current.data?.status).toBe(200);
        expect(await result.current.data?.json()).toStrictEqual({tax: 15315})
    })
})
