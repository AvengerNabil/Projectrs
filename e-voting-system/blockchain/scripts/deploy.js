async function main() {
    const Voting = await ethers.getContractFactory("Voting");

    const candidates = ["Alice", "Bob"];

    const contract = await Voting.deploy(candidates);
    await contract.deployed();

    console.log("Contract Address:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});