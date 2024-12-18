import { pool } from "../../../config/database";
import { getTuip } from "../../../controllers/tuipController";
import httpMocks from "node-mocks-http";

jest.mock("../../../config/database");

describe("getTuip", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      url: "/tuip/:id",
      params: { id: "1" },
      userData: { id: "1" },
    });
    res = httpMocks.createResponse();
  });

  it("should return tuip data if found", async () => {
    const mockData = [
      {
        tuipId: 1,
        tuipContent: "This is a tuip",
        tuipMultimedia: null,
        parent: null,
        quoting: null,
        secta: null,
        responsesCount: 0,
        quotingCount: 0,
        likesCount: 0,
        tuipCreatedAt: "2024-12-18",
        demonId: 1,
        userName: "Demon123",
        demonName: "Demon Name",
        profilePicture: "url_to_picture",
        youLiked: 1,
      },
    ];
    pool.query.mockResolvedValue([mockData]);

    await getTuip(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getData()).toEqual(JSON.stringify(mockData[0]));
  });

  it("should return 404 if tuip is not found", async () => {
    pool.query.mockResolvedValue([[]]);

    await getTuip(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getData()).toEqual(
      JSON.stringify({ message: "Tuip not found" })
    );
  });

  it("should return 500 if an error occurs", async () => {
    pool.query.mockRejectedValue(new Error("Database error")); 

    await getTuip(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toEqual(
      JSON.stringify({
        message: "Internal server error: ",
        error: new Error("Database error"),
      })
    );
  });
});
