module Api
  module V1
    class RoomTypesController < ApplicationController
      def index
        render json: RoomType.order(:name).map { |r| { name: r.name, price: r.price } }
      end
    end
  end
end