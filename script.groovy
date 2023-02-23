def buildApp() {
  echo "Building the application..."
  sh 'chmod +x Dockerfile'
  sh 'cat Dockerfile'
}


def buildImage() {
  echo "bulding  the docker image..."
  withCredentials([usernamePassword(credentialsId: 'my-dockerhub-cred',passwordVariabe: 'PASS',usernameVariable: 'USER')])
  sh 'docker build -t izuku/chatty-api:2.0 .'
  sh "echo $PASS | docker login -u $USER --password-stdin"
  sh 'docker push izuku/chatty-api:2.0'


}

def testApp() {
  echo "testing  the application..."
}

def deployApp() {
  echo "deploying the application..."
  echo "deploying version ${params.VERSION}"
}

return this
