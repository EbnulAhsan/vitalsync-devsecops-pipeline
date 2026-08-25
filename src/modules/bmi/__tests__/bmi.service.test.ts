import { prisma } from "../../../config/prisma";
import { BMIService } from "../bmi.service";

jest.mock("../../../config/prisma", () => ({
    prisma: {
        profile: {
            findUnique: jest.fn(),
        },
        bMIRecord: {
            create: jest.fn(),
        },
        weightHistory: {
            create: jest.fn(),
        },
    },
}));

const mockProfileFindUnique = prisma.profile.findUnique as jest.Mock;
const mockBMIRecordCreate = prisma.bMIRecord.create as jest.Mock;
const mockWeightHistoryCreate = prisma.weightHistory.create as jest.Mock;

describe("BMIService.calculateBMI", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should calculate BMI and classify it as NORMAL", async () => {
        const expectedRecord = {
            id: "bmi-1",
            userId: "user-1",
            weightKg: 70,
            heightCm: 175,
            bmiValue: 22.86,
            category: "NORMAL",
        };

        mockBMIRecordCreate.mockResolvedValue(expectedRecord);
        mockWeightHistoryCreate.mockResolvedValue({});

        const result = await BMIService.calculateBMI("user-1", {
            weightKg: 70,
            heightCm: 175,
        });

        expect(result).toEqual(expectedRecord);

        expect(mockBMIRecordCreate).toHaveBeenCalledWith({
            data: {
                userId: "user-1",
                weightKg: 70,
                heightCm: 175,
                bmiValue: 22.86,
                category: "NORMAL",
            },
        });

        expect(mockWeightHistoryCreate).toHaveBeenCalledWith({
            data: {
                userId: "user-1",
                weightKg: 70,
                note: "BMI calculation entry",
            },
        });
    });

    it("should use profile height when heightCm is not provided", async () => {
        mockProfileFindUnique.mockResolvedValue({
            heightCm: 180,
        });

        mockBMIRecordCreate.mockResolvedValue({
            id: "bmi-2",
            bmiValue: 27.78,
            category: "OVERWEIGHT",
        });

        mockWeightHistoryCreate.mockResolvedValue({});

        await BMIService.calculateBMI("user-2", {
            weightKg: 90,
        });

        expect(mockProfileFindUnique).toHaveBeenCalledWith({
            where: {
                userId: "user-2",
            },
            select: {
                heightCm: true,
            },
        });

        expect(mockBMIRecordCreate).toHaveBeenCalledWith({
            data: {
                userId: "user-2",
                weightKg: 90,
                heightCm: 180,
                bmiValue: 27.78,
                category: "OVERWEIGHT",
            },
        });
    });

    it("should reject zero or negative weight", async () => {
        await expect(
            BMIService.calculateBMI("user-3", {
                weightKg: 0,
                heightCm: 170,
            })
        ).rejects.toMatchObject({
            statusCode: 400,
            message: "Valid weightKg is required",
        });

        expect(mockBMIRecordCreate).not.toHaveBeenCalled();
        expect(mockWeightHistoryCreate).not.toHaveBeenCalled();
    });

    it("should reject the request when profile height is unavailable", async () => {
        mockProfileFindUnique.mockResolvedValue(null);

        await expect(
            BMIService.calculateBMI("user-4", {
                weightKg: 65,
            })
        ).rejects.toMatchObject({
            statusCode: 400,
            message: "heightCm is required. Please update profile height first.",
        });

        expect(mockBMIRecordCreate).not.toHaveBeenCalled();
    });

    it.each([
        [45, 170, 15.57, "UNDERWEIGHT"],
        [75, 170, 25.95, "OVERWEIGHT"],
        [100, 170, 34.6, "OBESE"],
    ])(
        "should classify weight %s kg and height %s cm as %s",
        async (weightKg, heightCm, expectedBMI, expectedCategory) => {
            mockBMIRecordCreate.mockImplementation(async ({ data }) => data);
            mockWeightHistoryCreate.mockResolvedValue({});

            const result = await BMIService.calculateBMI("user-5", {
                weightKg,
                heightCm,
            });

            expect(result).toMatchObject({
                bmiValue: expectedBMI,
                category: expectedCategory,
            });
        }
    );
});
