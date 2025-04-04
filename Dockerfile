FROM node:18-buster

WORKDIR /app

# Install Git (for cloning the centralized proto repository)
RUN apt-get update && apt-get install -y git

# Clone the centralized Proto repository into the container
RUN git clone https://github.com/HoangPC98/ecom-protos-grpc.git /app/proto

# Install application dependencies
COPY ./package*.json ./
RUN npm install

# Generate gRPC client/server code from the Proto files (e.g., for the helloworld.proto file)
# RUN npx grpc_tools_node_protoc --proto_path=/app/proto --js_out=import_style=commonjs,binary:/app/generated --grpc_out=/app/generated --plugin=protoc-gen-grpc=$(which grpc_tools_node_protoc_plugin) /app/proto/helloworld.proto

# Copy the rest of the application code into the container
COPY ./ /app

EXPOSE 8080

CMD [ "npm", "run", "dev" ]