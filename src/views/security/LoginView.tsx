import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
import { useContext } from 'react'
import useLoginApi from '@/hooks/api/useLoginApi'
import { useNavigate } from 'react-router-dom'
import { useLogo } from '@/hooks/useLogo';

export default function LoginView() {
  const { t } = useTranslation();
  const logoSrc = useLogo();
  const navigate = useNavigate();  
  const { logIn }: IAuthContext = useContext(AuthContext);
  const { userInfo } = useLoginApi();

  return (
    <div className="flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-background text-foreground' : 'bg-white text-black'}`}">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-8">
          <img
            src={logoSrc}
            alt="Logo"
            width="100%"
            height="100%"
            className="mb-6"
          />
          {
            userInfo?.anonymous === false ? 
              <Button className="w-full" onClick={() => navigate("/")} >
                {t("login.loggedInButton")}
              </Button> :
              <Button className="w-full" onClick={() => logIn()}>
                {t("login.button")}
              </Button>
          }
          
        </CardContent>
      </Card>
    </div>
  )
}
