const Verification = artifacts.require("Verification");

contract("Verification", (accounts) => {
    let verification;
    let expectedVerifier;

    before(async () => verification = await Verification.deployed());

    it("Can verify a painting using first account address", async () => {
        await verification.verify(8, 16, { from: accounts[0] });
        expectedVerifier = accounts[0];
    });

    it("Can fetch the address of an verifier by painting id", async () => {
        const verifier = await verification.verifiers(8);
        assert.equal(verifier, expectedVerifier, "The verifier of the painting should be first account");
    });

    it("Can fetch the address of all the verifiers", async () => {
        const verifiers = await verification.getVerifiers();
        assert.equal(verifiers[8], expectedVerifier, "The verifier of the painting should be in the " + 
            "collection");
    });
});