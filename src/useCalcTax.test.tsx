import { act, waitFor } from '@testing-library/react'
import { rest } from 'msw';
import { setupServer } from 'msw/node'

import { renderHook, waitForRequest } from './test-utils'

import { useCalcTax } from './useCalcTax'

// MSWサーバをセットアップ
const server = setupServer();
// テスト実行時の最初にサーバ待ち受けを開始
beforeAll(() => server.listen());
// テストケース内で設定したハンドラとリスナを各テストの実行後にリセット
afterEach(() => {
    server.resetHandlers();
    server.events.removeAllListeners();
});
// テストの実行が全て終わった後にサーバを停止
afterAll(() => server.close());

// HTTPメソッド名とキャプチャしたいURLを渡すとリクエストをキャプチャするPromiseを返す
const waitForCalcTaxRequest = () => waitForRequest(server, "POST", "http://localhost:8080/calc-tax");

describe("useCalcTax", () => { 
    it("所得税計算APIを呼び出せること", async () => { 
        server.use(
            rest.post("http://localhost:8080/calc-tax", async (req, res, ctx) => { 
                return res(ctx.status(200), ctx.json({ tax: 15315 }));
            })
        )

        // APIのモックとなるハンドラを登録し、指定したURLに対して指定したレスポンスを返す
        const pendingRequest = waitForCalcTaxRequest();

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
        expect(await result.current.data?.json()).toStrictEqual({ tax: 15315 })

        // キャプチャされた関数を呼び出す
        const request = await pendingRequest
        // キャプチャされたリクエストボディの内容を確認
        expect(await request.json()).toStrictEqual({
            yearsOfService: 6,
            isExecutive: false,
            isDisability: false,
            severancePay: 3000000,
        })
    })

    it("所得税計算APIがBadRequestを返す場合", async () => { 
        server.use(
            rest.post("http://localhost:8080/calc-tax", async (req, res, ctx) => { 
                return res(ctx.status(400), ctx.json({ message: "Invalid Parameter." }));
            }),
        )

        const { result } = renderHook(() => useCalcTax());

        act(() => { 
            result.current.mutate({
                yearsOfService: 6,
                isExecutive: false,
                isDisability: false,
                severancePay: 3000000,
            })
        })

        // 
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.isError).toBe(false);
        expect(result.current.data?.status).toBe(400);
        expect(await result.current.data?.json()).toStrictEqual({
            message: "Invalid Parameter.",
        })
    })
})
