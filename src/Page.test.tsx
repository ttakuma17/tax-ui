import { screen, waitFor} from "@testing-library/react";
import  userEvent  from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/lib/node";
import { Page } from "./Page";
import { render, waitForRequest } from "./test-utils";

const server = setupServer(
    rest.post("http://localhost:8080/calc-tax", async (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({tax:10000}));
    }),
)

beforeAll(() => server.listen());
afterEach(() => { 
    server.resetHandlers()
    server.events.removeAllListeners()
})

afterAll(() => server.close)

const waitForCalcRequest = () => waitForRequest(server, "POST", "http://localhost:8080/calc-tax")

// 勤続年数を入力できる
// 退職金を入力できる テストを追加 P295


describe("ページコンポーネント", () => { 
    it("所得税を計算できる", async () => { 
        const pendingRequest = waitForCalcRequest()
        const user = userEvent.setup()

        render(<Page />)

        await user.click(screen.getByText("所得税を計算する"))

        await waitFor(() =>  
            expect(screen.getByLabelText("tax").textContent).toBe("10,000円 "),
        ) 
        
        const request = await pendingRequest

        expect(await request.json()).toStrictEqual({
            yearsOfService: 10,
            isDisability: false,
            isExecutive: false,
            severancePay: 5000000
        })
    })
})

describe("勤続年数のバリデーションエラーになる", () => { 
    it.each`
    yearsOfServiceValue
    ${'-1'}
    ${'0'}
    ${'101'}
    ${'10.5'}
    `('勤続年数$yearsOfServiceValue', async ({ yearsOfServiceValue }) => {
        const user = userEvent.setup();
        render(<Page />)
        // 事前確認
        expect(screen.queryByText("有効な勤続年数を入力してください")).toBeNull()
        const yearsTextBox = screen.getByLabelText("勤続年数")
        await user.clear(yearsTextBox)
        await user.type(yearsTextBox, yearsOfServiceValue)

        await waitFor(() => { 
            expect(
                screen.getByLabelText("tax").textContent).toBe("---円 ")

        })
    })
})

describe("退職金のバリデーションエラーになる", () => { 
    it.each`
    severancePayValue
    ${'-1'}
    ${'1000000000001'}
    ${'8000000.1'}
    `('退職金$severancePayValue', async ({ severancePayValue }) => {
        const user = userEvent.setup();
        render(<Page />)
        // 事前確認
        expect(screen.queryByText("有効な退職金を入力してください")).toBeNull()
        const payTextBox = screen.getByLabelText("退職金")
        await user.clear(payTextBox)
        await user.type(payTextBox, severancePayValue)

        await waitFor(() =>
            expect(
                screen.getByText("有効な退職金を入力してください")
            ).toBeInTheDocument(),
        )
        expect(screen.getByLabelText("tax").textContent).toBe("---円 ")
    })
})