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
            isExecutive: true,
            severancePay: 5000000
        })
    })
})