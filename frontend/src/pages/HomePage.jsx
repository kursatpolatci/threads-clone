import { Button, Flex, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"

function HomePage() {
    const user = useRecoilValue(userAtom)
  return (
    <Link to={"/markzuckerberg"}>
        <Flex w={"full"} justifyContent={"center"}>
            <Button mx={"auto"}>Visit Profile Page</Button>
        </Flex>
        <Flex w={"full"} justifyContent={"center"} mt={5}>
            <Text>
                {user.user.name}
            </Text>
        </Flex>
    </Link>
)
}

export default HomePage